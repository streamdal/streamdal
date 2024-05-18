package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/hokaccha/go-prettyjson"
	gopretty "github.com/jedib0t/go-pretty/v6/table"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	streamdal "github.com/streamdal/streamdal/sdks/go"
)

type Result struct {
	Input                 []byte                   `json:"-"`
	Output                []byte                   `json:"-"`
	InputStr              string                   `json:"input"`
	OutputStr             string                   `json:"output"`
	ProcessStatus         protos.ExecStatus        `json:"-"`
	ProcessStatusStr      string                   `json:"status"`
	ProcessStatusMessage  string                   `json:"status_message"`
	ExecTime              time.Duration            `json:"-"`
	ExecTimeStr           string                   `json:"exec_time"`
	ProcessPipelineStatus []*protos.PipelineStatus `json:"pipeline_status"`
	Date                  time.Time                `json:"date"`
	Metadata              map[string]string        `json:"metadata"`
}

func (r *Demo) display(pre []byte, post *streamdal.ProcessResponse, execTime time.Duration) {
	if post == nil {
		panic("display(): post cannot be nil")
	}

	result := &Result{
		Input:                 pre,
		InputStr:              string(pre),
		OutputStr:             string(post.Data),
		Output:                post.Data,
		ProcessStatus:         post.Status,
		ProcessStatusStr:      r.translateStatus(post.Status),
		ProcessStatusMessage:  fromStrPtr(post.StatusMessage),
		ExecTime:              execTime,
		ExecTimeStr:           execTime.String(),
		ProcessPipelineStatus: post.PipelineStatus,
		Date:                  time.Now(),
		Metadata:              post.Metadata,
	}

	switch r.config.OutputType {
	case OutputTypePlaintext:
		r.displayPlaintext(result)
	case OutputTypeTabular:
		r.displayTabular(result)
	case OutputTypeJSON:
		r.displayJSON(result)
	default:
		panic(fmt.Sprintf("unkknown output type '%s'", r.config.OutputType))
	}
}

func (r *Demo) displayJSON(result *Result) {
	if result == nil {
		panic("displayJSON(): result cannot be nil")
	}

	data, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		panic("displayJSON(): failed to marshal result")
	}

	if !r.config.DisableColor {
		var err error
		prettyData, err := prettyjson.Format(data)
		if err != nil {
			logrus.Debug("failed to prettyjson format: %s", err)
		} else {
			data = prettyData
		}
	}

	fmt.Println(string(data))
}

func (r *Demo) displayTabular(result *Result) {
	if result == nil {
		panic("displayTabular(): result cannot be nil")
	}

	tw := gopretty.NewWriter()
	tw.Style().Box = gopretty.StyleBoxDouble
	now := result.Date.Format(time.RFC1123)

	var (
		status  string
		message string
	)

	message = trunc(result.ProcessStatusMessage)
	status = r.translateStatus(result.ProcessStatus)

	tw.AppendRow(gopretty.Row{bold("Date"), now})
	tw.AppendRow(gopretty.Row{bold("Last Status"), status})
	tw.AppendRow(gopretty.Row{bold("Last Status Message"), message})

	if r.config.DisplayExecTime {
		tw.AppendRow(gopretty.Row{bold("Execution Time"), result.ExecTime})
	}

	// Display metadata if output level is high
	if r.config.OutputLevel >= OutputLevelHigh {
		var metadata string

		if len(result.Metadata) > 0 {
			for k, v := range result.Metadata {
				metadata += fmt.Sprintf("%s => %s, ", k, v)
			}

			metadata = strings.TrimSuffix(metadata, ", ")
		}

		tw.AppendRow(gopretty.Row{bold(fmt.Sprintf("Metadata (%d)", len(result.Metadata))), metadata})
	}

	// Display pipeline debug if output level is high
	if r.config.OutputLevel >= OutputLevelHigh {
		r.generatePipelineDebugTabular(tw, result)
	}

	// Display before/after output if output level is medium
	if r.config.OutputLevel >= OutputLevelMed {
		generateDataDiffTabular(tw, result)
	}

	fmt.Print(tw.Render() + "\n")
}

func (r *Demo) displayPlaintext(result *Result) {
	if result == nil {
		panic("displayPlaintext(): result cannot be nil")
	}

	fmt.Printf("Date:           %s\n", result.Date.Format(time.RFC1123))
	fmt.Printf("Status:         %s\n", r.translateStatus(result.ProcessStatus))
	fmt.Printf("Status Message: %s\n", result.ProcessStatusMessage)
	fmt.Printf("Execution Time: %s\n", result.ExecTime)

	// Display metadata if output level is high
	if r.config.OutputLevel >= OutputLevelMed {
		var metadata string

		if len(result.Metadata) > 0 {
			for k, v := range result.Metadata {
				metadata += fmt.Sprintf("%s => %s, ", k, v)
			}

			metadata = strings.TrimSuffix(metadata, ", ")
		}

		fmt.Printf("Metadata (%d):   %s\n", len(result.Metadata), metadata)
	}

	// Display pipeline debug if output level is high
	if r.config.OutputLevel >= OutputLevelHigh {
		r.displayPipelineDebugPlaintext(result)
	}

	// Display before/after output if output level is medium
	if r.config.OutputLevel >= OutputLevelMed {
		r.displayDataDiffPlaintext(result)
	}

	fmt.Printf("\n\n====================================================\n\n")
}

func (r *Demo) displayDataDiffPlaintext(result *Result) {
	if result == nil {
		panic("displayDataDiffPlaintext(): result cannot be nil")
	}

	// Do not try to format non-JSON data
	if result.Input[0] != '{' {
		fmt.Println("Before:")
		fmt.Println(string(result.Input))
		fmt.Println("After:")
		fmt.Println(string(result.Output))
		return
	}

	var (
		preFormatted  []byte
		postFormatted []byte
		err           error
	)

	// This is JSON, format pre data
	if r.config.DisableColor {
		preFormatted, err = json.MarshalIndent(result.Input, "", "  ")
	} else {
		preFormatted, err = prettyjson.Format(result.Input)
	}

	if err != nil {
		logrus.Errorf("unable to format input data: %s", err)
		preFormatted = result.Input
	}

	// Format post data
	if r.config.DisableColor {
		postFormatted, err = json.MarshalIndent(result.Output, "", "  ")
	} else {
		postFormatted, err = prettyjson.Format(result.Output)
	}

	if err != nil {
		logrus.Errorf("unable to format output data: %s", err)
		postFormatted = result.Output
	}

	// Determine title
	postTitle := "Data After (unchanged)"

	if string(result.Input) != string(result.Output) {
		postTitle = "Data After " + underline("(changed)")
	}

	fmt.Printf("Data Before:\n%s\n", preFormatted)
	fmt.Printf("%s:\n%s\n", postTitle, postFormatted)
}

func fromStrPtr(s *string) string {
	if s == nil {
		return "N/A"
	}

	return *s
}

func generateDataDiffTabular(tw gopretty.Writer, result *Result) {
	if result == nil {
		panic("generateDataDiffTabular(): result cannot be nil")
	}

	// Plaintext
	// TODO: can we add syntax highlighting to changed val?
	if result.Input[0] != '{' {
		tw.AppendSeparator()
		tw.AppendRow(gopretty.Row{bold("Before"), bold("After")})
		tw.AppendSeparator()
		tw.AppendRow(gopretty.Row{string(result.Input), string(result.Output)})
		return
	}

	// Format pre data
	preFormatted, err := prettyjson.Format(result.Input)
	if err != nil {
		logrus.Debugf("failed to format data: %s (pre: %s)", err, result.Input)

		// Format failed, just print raw data
		preFormatted = result.Input
	}

	// Format post data
	postFormatted, err := prettyjson.Format(result.Output)
	if err != nil {
		logrus.Debugf("failed to format data: %s (post: %s)", err, result.Output)

		// Format failed, just print raw data
		postFormatted = result.Output
	}

	// Determine post-title
	postTitle := "After (unchanged)"

	if string(result.Input) != string(result.Output) {
		postTitle = "After " + underline("(changed)")
	}

	tw.AppendSeparator()
	tw.AppendRow(gopretty.Row{bold("Before"), bold(postTitle)})
	tw.AppendSeparator()
	tw.AppendRow(gopretty.Row{string(preFormatted), string(postFormatted)})
}

func truncStrPtr(s *string) string {
	if s == nil {
		return "N/A"
	}

	return trunc(*s)
}

func trunc(s string) string {
	if len(s) > 80 {
		return s[:80] + "..."
	}

	return s
}

// Display pre-indented, plaintext pipeline & step debug output
func (r *Demo) displayPipelineDebugPlaintext(result *Result) {
	if result == nil {
		panic("generatePipelineDebugPlaintext(): result cannot be nil")
	}

	// If there are no pipelines, don't bother
	if len(result.ProcessPipelineStatus) == 0 {
		return
	}

	fmt.Println("Num Pipelines:  " + strconv.Itoa(len(result.ProcessPipelineStatus)))

	for pIndex, pd := range result.ProcessPipelineStatus {
		fmt.Printf("(%d) Pipeline ID / Name\n", pIndex+1)

		for _, s := range pd.StepStatus {
			status := r.translateStatus(s.Status)

			fmt.Printf("  Step Name:    %s\n", s.Name)
			fmt.Printf("  Step Status:  %s\n", status)
			fmt.Printf("  Step Message: %s\n", truncStrPtr(s.StatusMessage))
		}
	}
}

func (r *Demo) generatePipelineDebugTabular(tw gopretty.Writer, result *Result) {
	if result == nil {
		panic("generatePipelineDebugTabular(): result cannot be nil")
	}

	// If there are no pipelines, don't bother
	if len(result.ProcessPipelineStatus) == 0 {
		tw.AppendRow(gopretty.Row{bold("Num Pipelines"), "None"})
		return
	}

	tw.AppendSeparator()

	tw.AppendRow(gopretty.Row{bold("Num Pipelines"), len(result.ProcessPipelineStatus)})

	for pIndex, pd := range result.ProcessPipelineStatus {
		tw.AppendRow(gopretty.Row{bold(fmt.Sprintf("(%d) Pipeline ID / Name", pIndex+1)), pd.Id + " / " + pd.Name})

		for _, s := range pd.StepStatus {
			status := r.translateStatus(s.Status)

			tw.AppendRow(gopretty.Row{bold("  ┌── Step Name"), s.Name})
			tw.AppendRow(gopretty.Row{bold("  ├── Step Status"), status})
			tw.AppendRow(gopretty.Row{bold("  └── Step Message"), truncStrPtr(s.StatusMessage)})
		}
	}
}

func (r *Demo) translateStatus(status protos.ExecStatus) string {
	switch status {
	case protos.ExecStatus_EXEC_STATUS_TRUE:
		if r.config.DisableColor || r.config.OutputType == OutputTypeJSON {
			return "TRUE"
		}

		return color.GreenString("TRUE")
	case protos.ExecStatus_EXEC_STATUS_FALSE:
		if r.config.DisableColor || r.config.OutputType == OutputTypeJSON {
			return "FALSE"
		}

		return color.YellowString("FALSE")
	case protos.ExecStatus_EXEC_STATUS_ERROR:
		if r.config.DisableColor || r.config.OutputType == OutputTypeJSON {
			return "ERROR"
		}

		return color.RedString("ERROR")
	case protos.ExecStatus_EXEC_STATUS_ASYNC:
		if r.config.DisableColor || r.config.OutputType == OutputTypeJSON {
			return "ASYNC"
		}

		return color.HiBlueString("ASYNC")
	case protos.ExecStatus_EXEC_STATUS_SAMPLING:
		if r.config.DisableColor || r.config.OutputType == OutputTypeJSON {
			return "SAMPLING"
		}

		return color.HiBlueString("SAMPLING")
	default:
		if r.config.DisableColor || r.config.OutputType == OutputTypeJSON {
			return status.String()
		}

		return color.HiRedString("%s", status)
	}
}
