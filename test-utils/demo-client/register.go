package main

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"time"

	"github.com/fatih/color"
	"github.com/hokaccha/go-prettyjson"
	gopretty "github.com/jedib0t/go-pretty/v6/table"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/snitch-go-client"
)

type Register struct {
	inputCh chan []byte
	config  *Config
	log     *logrus.Entry
}

func runRegister(cfg *Config) error {
	r := &Register{
		config:  cfg,
		inputCh: make(chan []byte, 1),
		log:     logrus.WithField("cmd", "register"),
	}

	errCh := make(chan error, 1)
	//wg := &sync.WaitGroup{}

	if cfg.Register.ConsumerInputType != "none" {
		r.log.Debug("launching reader")
		//wg.Add(1)

		// Launch something that will read data from $consumer_input and write
		// results to input ch.
		go func() {
			//defer wg.Done()

			if err := r.runReader(); err != nil {
				errCh <- errors.Wrap(err, "reader error")
			}
		}()
	}

	// Launch a client regardless if it's doing anything or not
	go func() {
		r.log.Debug("launching client")

		if err := r.runClient(); err != nil {
			errCh <- errors.Wrap(err, "client error")
		}
	}()

	r.log.Debug("main: listening for errors...")

	// Read from errCh until CTRL-C
	err := <-errCh

	if err != nil {
		r.log.Errorf("ERROR: %s", err)
		return err
	}

	return nil
}

func (r *Register) runReader() error {
	llog := r.log.WithField("func", "runReader")

	var err error

	switch r.config.Register.ConsumerInputType {
	case "file":
		llog.Info("reading from file")
		err = r.runFileReader()
	case "none":
		llog.Info("no consumer input, exiting")
		return nil
	}

	if err != nil {
		return errors.Wrap(err, "reader error")
	}

	return nil
}

func (r *Register) runFileReader() error {
	llog := r.log.WithField("func", "runFileReader")

	// Read the file continuously and write to inputCh
	for {
		f, err := os.Open(r.config.Register.ConsumerInputFile.Name())
		if err != nil {
			return errors.Wrap(err, "failed to open file")
		}

		scanner := bufio.NewScanner(f)

		for scanner.Scan() {
			r.inputCh <- scanner.Bytes()
			time.Sleep(time.Second)
		}

		llog.Debug("reached end of file; restarting")
	}
}

func (r *Register) runClient() error {
	llog := r.log.WithField("func", "runClient")

	llog.Debug("before instantiation")

	sc, err := snitch.New(&snitch.Config{
		SnitchURL:       r.config.SnitchAddress,
		SnitchToken:     r.config.SnitchToken,
		ServiceName:     r.config.ServiceName,
		PipelineTimeout: 0,
		StepTimeout:     0,
		DryRun:          false,
		ShutdownCtx:     context.Background(), // TODO: Why is this required?
		Logger:          r.log,
		ClientType:      0, // This is intended primarily for shims - shims will specify that they're a shim
		Audiences:       nil,
	})
	if err != nil {
		return errors.Wrap(err, "failed to create snitch client")
	}

	for {
		if r.config.Register.ConsumerInputType == "none" {
			llog.Debug("no input data, nothing to do - noop")
			time.Sleep(time.Second * 1)
			continue
		}

		// Consumer will have input - read input data
		input := <-r.inputCh

		resp, err := sc.Process(context.Background(), &snitch.ProcessRequest{
			ComponentName: r.config.Register.ComponentName,
			OperationType: snitch.OperationType(r.config.Register.OperationType),
			OperationName: r.config.Register.OperationName,
			Data:          input,
		})

		r.display(input, resp, err)
	}
}

func (r *Register) display(pre []byte, post *snitch.ProcessResponse, err error) {
	tw := gopretty.NewWriter()
	tw.Style().Box = gopretty.StyleBoxDouble
	now := time.Now().Format(time.RFC1123)

	bold := color.New(color.Bold).SprintFunc()
	underline := color.New(color.Underline).SprintFunc()

	// Set status and msg
	status := color.GreenString("SUCCESS")
	message := color.GreenString(post.Message)

	if err != nil {
		status = color.RedString("FAILURE")
		message = color.RedString("Snitch error: " + err.Error())
	}

	if post.Error {
		status = color.RedString("FAILURE")
		message = color.RedString(post.Message)
	}

	// Format pre data
	preFormatted, err := prettyjson.Format(pre)
	if err != nil {
		r.log.Debugf("failed to format data: %s", err)

		// Format failed, just print raw data
		preFormatted = pre
	}

	// Format post data
	postFormatted, err := prettyjson.Format(post.Data)
	if err != nil {
		r.log.Debugf("failed to format data: %s", err)

		// Format failed, just print raw data
		postFormatted = post.Data
	}

	// Determine post-title
	postTitle := "Post-Snitch (unchanged)"

	if err == nil && !post.Error && string(pre) != string(post.Data) {
		postTitle = "Post-Snitch " + underline("(changed)")
	}

	tw.AppendRow(gopretty.Row{bold("Date"), now})
	tw.AppendRow(gopretty.Row{bold("Status"), status})
	tw.AppendRow(gopretty.Row{bold("Message"), message})
	tw.AppendSeparator()
	tw.AppendRow(gopretty.Row{bold("Pre-Snitch"), bold(postTitle)})
	tw.AppendSeparator()
	tw.AppendRow(gopretty.Row{string(preFormatted), string(postFormatted)})
	fmt.Printf(tw.Render() + "\n")
}
