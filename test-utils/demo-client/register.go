package main

import (
	"bufio"
	"context"
	"fmt"
	"math/rand"
	"os"
	"strconv"
	"time"

	"github.com/fatih/color"
	"github.com/hokaccha/go-prettyjson"
	gopretty "github.com/jedib0t/go-pretty/v6/table"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/snitch-go-client"
)

type Register struct {
	config *Config
	log    *logrus.Entry
}

func runRegister(cfg *Config) error {
	r := &Register{
		config: cfg,
		log:    logrus.WithField("cmd", "register"),
	}

	// Global err channel
	errCh := make(chan error, 1)

	for i := 0; i < cfg.Register.NumInstances; i++ {
		workerID := i

		// Dedicated read channel for each worker
		readCh := make(chan []byte, 1)

		if cfg.Register.ConsumerInputType != "none" {
			r.log.Debugf("launching reader '%d'", workerID)

			// Launch something that will read data from $consumer_input and write
			// results to input ch.
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

func (r *Register) runReader(workerID int, readCh chan []byte) error {
	llog := r.log.WithField("func", "runReader").WithField("worker_id", workerID)

	var err error

	switch r.config.Register.ConsumerInputType {
	case "file":
		llog.Info("reading from file")
		err = r.runFileReader(workerID, readCh)
	case "none":
		llog.Info("no consumer input, exiting")
		return nil
	}

	if err != nil {
		return errors.Wrap(err, "reader error")
	}

	return nil
}

func (r *Register) runFileReader(workerID int, readCh chan []byte) error {
	llog := r.log.WithField("func", "runFileReader").WithField("worker_id", workerID)

	// Read the file continuously and write to inputCh
	for {
		f, err := os.Open(r.config.Register.ConsumerInputFile.Name())
		if err != nil {
			return errors.Wrap(err, "failed to open file")
		}

		scanner := bufio.NewScanner(f)

		for scanner.Scan() {
			readCh <- scanner.Bytes()
			time.Sleep(time.Second)
		}

		llog.Debug("reached end of file; restarting")
	}
}

func (r *Register) newClient() (*snitch.Snitch, error) {
	cfg := &snitch.Config{
		SnitchURL:       r.config.SnitchAddress,
		SnitchToken:     r.config.SnitchToken,
		ServiceName:     r.config.ServiceName,
		PipelineTimeout: 0,
		StepTimeout:     0,
		DryRun:          false,
		ShutdownCtx:     context.Background(), // TODO: Why is this required?
		ClientType:      0,                    // This is intended primarily for shims - shims will specify that they're a shim
		Audiences:       nil,
	}

	if r.config.InjectLogger {
		cfg.Logger = r.log
	}

	return snitch.New(cfg)
}

func (r *Register) runClient(workerID int, readCh chan []byte) error {
	llog := r.log.WithField("func", "runClient").WithField("worker_id", workerID)

	sc, err := r.newClient()
	if err != nil {
		return errors.Wrap(err, "failed to create initial snitch client")
	}

	var reconnectTime time.Time

	for {
		if !reconnectTime.IsZero() && reconnectTime.After(time.Now()) {
			r.log.Debugf("reconnecting after '%v' seconds", reconnectTime.Sub(time.Now()).Seconds())

			sc, err = r.newClient()
			if err != nil {
				return errors.Wrapf(err, "failed to create snitch client for worker '%s'", workerID)
			}
		}

		// If ReconnectInterval is set, we want to reconnect; will take effect next iteration
		if r.config.Register.ReconnectInterval > 0 {
			// Do we want to reconnect randomly?
			if r.config.Register.ReconnectRandom {
				reconnectTime = time.Now().Add(time.Duration(rand.Intn(r.config.Register.ReconnectInterval)) * time.Second)
			} else {
				reconnectTime = time.Now().Add(time.Duration(r.config.Register.ReconnectInterval) * time.Second)
			}

			r.log.Debugf("next reconnect: %s", reconnectTime)
		}

		if r.config.Register.ConsumerInputType == "none" {
			llog.Debug("no input data, nothing to do - noop")
			time.Sleep(time.Second * 1)
			continue
		}

		// Consumer will have input - read input data
		input := <-readCh

		operationName := r.config.Register.OperationName

		// Give each instance a unique operation name
		if r.config.Register.NumInstances > 1 {
			operationName = operationName + "-" + strconv.Itoa(workerID)
		}

		resp, err := sc.Process(context.Background(), &snitch.ProcessRequest{
			ComponentName: r.config.Register.ComponentName,
			OperationType: snitch.OperationType(r.config.Register.OperationType),
			OperationName: operationName,
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

	if !r.config.Quiet {
		tw.AppendSeparator()
		tw.AppendRow(gopretty.Row{bold("Pre-Snitch"), bold(postTitle)})
		tw.AppendSeparator()
		tw.AppendRow(gopretty.Row{string(preFormatted), string(postFormatted)})
	}

	fmt.Printf(tw.Render() + "\n")
}
