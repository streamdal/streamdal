package main

import (
	"bufio"
	"context"
	"fmt"
	"math/rand"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/hokaccha/go-prettyjson"
	gopretty "github.com/jedib0t/go-pretty/v6/table"
	jd "github.com/josephburnett/jd/lib"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"

	streamdal "github.com/streamdal/go-sdk"
)

type Demo struct {
	config *Config
	log    *logrus.Entry
}

var (
	bold      = color.New(color.Bold).SprintFunc()
	underline = color.New(color.Underline).SprintFunc()
)

// Run is the main entry point for running the demo
func Run(cfg *Config) error {
	r := &Demo{
		config: cfg,
		log:    logrus.WithField("cmd", "client"),
	}

	// Global err channel
	errCh := make(chan error, 1)

	for i := 0; i < cfg.NumInstances; i++ {
		workerID := i

		// Dedicated read channel for each worker
		readCh := make(chan []byte, 1)

		if cfg.DataSourceType == "file" {
			r.log.Debugf("launching file reader '%d'", workerID)

			// Launch a reader that will read data from somewhere and write it
			// to the readCh
			go func() {
				if err := r.runReader(workerID, readCh); err != nil {
					errCh <- errors.Wrap(err, "reader error")
				}
			}()
		}

		// Launch a client regardless if it's doing anything or not
		go func() {
			r.log.Debugf("launching client '%d'", workerID)

			if err := r.runClient(workerID, readCh); err != nil {
				errCh <- errors.Wrap(err, "client error")
			}
		}()

	}

	r.log.Debug("main: listening for errors...")

	// Read from errCh until CTRL-C
	err := <-errCh

	if err != nil {
		r.log.Errorf("ERROR: %s", err)
		return err
	}

	return nil
}

// Wrapper for the type of reader
func (r *Demo) runReader(workerID int, readCh chan []byte) error {
	llog := r.log.WithField("func", "runReader").WithField("worker_id", workerID)

	var err error

	switch r.config.DataSourceType {
	case "file":
		llog.Info("reading from file")
		err = r.runFileReader(workerID, readCh)
	case "none":
		llog.Info("'none' data source type - nothing to do")
		return nil
	}

	if err != nil {
		return errors.Wrap(err, "reader error")
	}

	return nil
}

func (r *Demo) runFileReader(workerID int, readCh chan []byte) error {
	seed := rand.New(rand.NewSource(time.Now().UnixNano()))

	// Figure out the MIN and MAX number of execs per sec we'll do (in nanos)
	rateMin := int64(1_000_000_000 / r.config.MessageRate[0])
	rateMax := int64(1_000_000_000 / r.config.MessageRate[0])

	// If a range is provided, use that as the max
	if len(r.config.MessageRate) > 1 {
		rateMax = int64(1_000_000_000 / r.config.MessageRate[1])
	}

	// Tick will occur every MIN
	rateTicker := time.NewTicker(time.Nanosecond * time.Duration(rateMin))

	// Read the file continuously and write to inputCh
	for {
		f, err := os.Open(r.config.DataSourceFile.Name())
		if err != nil {
			return errors.Wrap(err, "failed to open file")
		}

		reader := bufio.NewReader(f)

		for {
			// Wait for a tick
			<-rateTicker.C

			// Sleep for a random amount of time between min and max rate
			time.Sleep(time.Nanosecond * time.Duration(seed.Intn(int((rateMax-rateMin)+rateMin))))

			// Try to read line
			line, err := reader.ReadBytes('\n')
			if err != nil {
				break // EOF or other err
			}

			readCh <- line
		}

		if err := f.Close(); err != nil {
			return errors.Wrap(err, "failed to close file")
		}

		// reached end of file; restarting
	}
}

func (r *Demo) newClient() (*streamdal.Streamdal, error) {
	cfg := &streamdal.Config{
		ServerURL:       r.config.ServerAddress,
		ServerToken:     r.config.ServerToken,
		ServiceName:     r.config.ServiceName,
		PipelineTimeout: 0,
		StepTimeout:     0,
		DryRun:          false,
		ShutdownCtx:     context.Background(),
		ClientType:      0,   // This is intended primarily for shims - shims will specify that they're a shim
		Audiences:       nil, // We could specify an audience here if we know it ahead of time; otherwise specify in .Process()
	}

	if r.config.InjectLogger {
		cfg.Logger = r.log
	}

	return streamdal.New(cfg)
}

func (r *Demo) runClient(workerID int, readCh chan []byte) error {
	llog := r.log.WithField("func", "runClient").WithField("worker_id", workerID)

	sc, err := r.newClient()
	if err != nil {
		return errors.Wrap(err, "failed to create initial streamdal client")
	}

	var reconnectTime time.Time

	for {
		if !reconnectTime.IsZero() && reconnectTime.After(time.Now()) {
			r.log.Debugf("reconnecting after '%v' seconds", reconnectTime.Sub(time.Now()).Seconds())

			sc, err = r.newClient()
			if err != nil {
				return errors.Wrapf(err, "failed to create client for worker '%d'", workerID)
			}
		}

		// If ReconnectInterval is set, we want to reconnect; will take effect next iteration
		if r.config.ReconnectInterval > 0 {
			// Do we want to reconnect randomly?
			if r.config.ReconnectRandom {
				reconnectTime = time.Now().Add(time.Duration(rand.Intn(r.config.ReconnectInterval)) * time.Second)
			} else {
				reconnectTime = time.Now().Add(time.Duration(r.config.ReconnectInterval) * time.Second)
			}

			r.log.Debugf("next reconnect: %s", reconnectTime)
		}

		if r.config.DataSourceType == "none" {
			llog.Debug("no data source, nothing to do - noop")
			time.Sleep(time.Second * 1)
			continue
		}

		// Consumer will have input - read input data
		input := <-readCh

		operationName := r.config.OperationName

		// Give each instance a unique operation name
		if r.config.NumInstances > 1 {
			operationName = operationName + "-" + strconv.Itoa(workerID)
		}

		resp := sc.Process(context.Background(), &streamdal.ProcessRequest{
			ComponentName: r.config.ComponentName,
			OperationType: streamdal.OperationType(r.config.OperationType),
			OperationName: operationName,
			Data:          input,
		})

		r.display(input, resp, err)
	}
}

func (r *Demo) display(pre []byte, post *streamdal.ProcessResponse, err error) {
	tw := gopretty.NewWriter()
	tw.Style().Box = gopretty.StyleBoxDouble
	now := time.Now().Format(time.RFC1123)

	var (
		status  string
		message string
	)

	message = "no status message"

	if post.StatusMessage != nil {
		message = *post.StatusMessage
	}

	message = trunc(message)
	status = translateStatus(post.Status)

	tw.AppendRow(gopretty.Row{bold("Date"), now})
	tw.AppendRow(gopretty.Row{bold("Last Status"), status})
	tw.AppendRow(gopretty.Row{bold("Last Status Message"), message})

	// If not quiet, display metadata and pipeline debug info
	if !r.config.Quiet {
		var metadata string

		if len(post.Metadata) > 0 {
			for k, v := range post.Metadata {
				metadata += fmt.Sprintf("%s => %s, ", k, v)
			}

			metadata = strings.TrimSuffix(metadata, ", ")
		}

		tw.AppendRow(gopretty.Row{bold(fmt.Sprintf("Metadata (%d)", len(post.Metadata))), metadata})

		generatePipelineDebug(tw, post)
		generateDataDiff(tw, pre, post)
	}

	fmt.Print(tw.Render() + "\n")
}

func generateDataDiff(tw gopretty.Writer, pre []byte, post *streamdal.ProcessResponse) {
	// Format pre data
	preFormatted, err := prettyjson.Format(pre)
	if err != nil {
		logrus.Debugf("failed to format data: %s (pre: %s)", err, pre)

		// Format failed, just print raw data
		preFormatted = pre
	}

	// Format post data
	postFormatted, err := prettyjson.Format(post.Data)
	if err != nil {
		logrus.Debugf("failed to format data: %s (post: %s)", err, post.Data)

		// Format failed, just print raw data
		postFormatted = post.Data
	}

	// Determine post-title
	postTitle := "After (unchanged)"

	if string(pre) != string(post.Data) {
		postTitle = "After " + underline("(changed)")
		postDiffFormatted, err := generateJSONDiff(pre, post.Data)
		if err != nil {
			logrus.Debugf("failed to generate JSON diff: %s", err)
		} else {
			postFormatted = postDiffFormatted
		}
	}

	tw.AppendSeparator()
	tw.AppendRow(gopretty.Row{bold("Before"), bold(postTitle)})
	tw.AppendSeparator()
	tw.AppendRow(gopretty.Row{string(preFormatted), string(postFormatted)})
}

func generateJSONDiff(pre, post []byte) ([]byte, error) {
	a, err := jd.ReadJsonString(string(pre))
	if err != nil {
		return nil, errors.Wrap(err, "unable to read pre JSON")
	}

	b, err := jd.ReadJsonString(string(post))
	if err != nil {
		return nil, errors.Wrap(err, "unable to read post JSON")
	}

	diff := a.Diff(b)

	return []byte(diff.Render(jd.COLOR)), nil
}

func truncp(s *string) string {
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

func generatePipelineDebug(tw gopretty.Writer, post *streamdal.ProcessResponse) {
	// If there are no pipelines, don't bother
	if len(post.PipelineStatus) == 0 {
		tw.AppendRow(gopretty.Row{bold("Num Pipelines"), "None"})
		return
	}

	tw.AppendSeparator()

	tw.AppendRow(gopretty.Row{bold("Num Pipelines"), len(post.PipelineStatus)})

	for pIndex, pd := range post.PipelineStatus {
		tw.AppendRow(gopretty.Row{bold(fmt.Sprintf("(%d) Pipeline ID / Name", pIndex+1)), pd.Id + " / " + pd.Name})

		for _, s := range pd.StepStatus {
			status := translateStatus(s.Status)

			tw.AppendRow(gopretty.Row{bold("  ┌── Step Name"), s.Name})
			tw.AppendRow(gopretty.Row{bold("  ├── Step Status"), status})
			tw.AppendRow(gopretty.Row{bold("  └── Step Message"), truncp(s.StatusMessage)})
		}
	}
}

func translateStatus(status protos.ExecStatus) string {
	switch status {
	case protos.ExecStatus_EXEC_STATUS_TRUE:
		return color.GreenString("TRUE")
	case protos.ExecStatus_EXEC_STATUS_FALSE:
		return color.YellowString("FALSE")
	case protos.ExecStatus_EXEC_STATUS_ERROR:
		return color.RedString("ERROR")
	default:
		return color.HiRedString("%s", status)
	}
}
