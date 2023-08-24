package main

import (
	"bufio"
	"context"
	"os"
	"time"

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
		ClientType:      0, // TODO: Why do we have this here?
		Audiences:       nil,
	})
	if err != nil {
		return errors.Wrap(err, "failed to create snitch client")
	}

	llog.Debug("after instantiation")

	for {
		if r.config.Register.ConsumerInputType == "none" {
			llog.Debug("no input data, nothing to do - noop")
			time.Sleep(time.Second * 1)
			continue
		}

		// Consumer will have input - read input data
		input := <-r.inputCh

		llog.Debugf("Process() input: %s", input)

		_, err := sc.Process(context.Background(), &snitch.ProcessRequest{
			ComponentName: r.config.Register.ComponentName,
			OperationType: snitch.OperationType(r.config.Register.OperationType),
			OperationName: r.config.Register.OperationName,
			Data:          input,
		})

		llog.Debug("Process() after exec")

		if err != nil {
			r.log.Errorf("failed to process data: %s", err)
			return errors.Wrap(err, "failed to process data")
		}

		llog.Debug("Process() after err check")
	}
}
