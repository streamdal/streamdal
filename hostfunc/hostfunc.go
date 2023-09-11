// Package hostfunc contains host function methods. They are separated from
// snitch-go-client in order to keep the public API clean.
package hostfunc

import (
	"github.com/pkg/errors"

	"github.com/streamdal/snitch-go-client/kv"
	"github.com/streamdal/snitch-go-client/logger"
)

type HostFunc struct {
	kv  kv.IKV
	log logger.Logger
}

func New(kv kv.IKV, log logger.Logger) (*HostFunc, error) {
	if kv == nil {
		return nil, errors.New("kv cannot be nil")
	}

	return &HostFunc{
		kv:  kv,
		log: log,
	}, nil
}
