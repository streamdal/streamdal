package main

import (
	"bufio"
	"context"
	"math/rand"
	"os"
	"strconv"
	"time"

	"github.com/fatih/color"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"

	streamdal "github.com/streamdal/streamdal/sdks/go"
)

const (
	OutputLevelNone = 0
	OutputLevelLow  = 1
	OutputLevelMed  = 2
	OutputLevelHigh = 3

	OutputTypePlaintext = "plaintext"
	OutputTypeTabular   = "tabular"
	OutputTypeJSON      = "json"
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
		EnableStdout:    true,
		EnableStderr:    true,
	}

	if r.config.InjectLogger {
		cfg.Logger = r.log
	}

	if r.config.Async {
		cfg.Mode = streamdal.ModeAsync
	}

	if r.config.SamplingRate > 0 {
		cfg.SamplingEnabled = true
		cfg.SamplingRate = r.config.SamplingRate
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
		if r.config.UniqueOperationName {
			operationName = operationName + "-" + strconv.Itoa(workerID)
		}

		timeStart := time.Now()

		resp := sc.Process(context.Background(), &streamdal.ProcessRequest{
			ComponentName: r.config.ComponentName,
			OperationType: streamdal.OperationType(r.config.OperationType),
			OperationName: operationName,
			Data:          input,
		})

		timeDiff := time.Now().Sub(timeStart)

		r.display(input, resp, timeDiff)
	}
}
