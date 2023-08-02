package grpcapi

import (
	. "github.com/onsi/ginkgo"
)

var _ = Describe("External gRPC API", func() {
	Describe("Register", func() {
		It("should register a new client", func() {

		})

		It("should error without auth token", func() {

		})

		It("should error with invalid auth token", func() {

		})

		It("should error with no session ID", func() {

		})

		It("should remove session keys from K/V on deregister", func() {

		})

		It("keys should disappear without heartbeat", func() {

		})
	})

	Describe("Heartbeat", func() {
		It("heartbeat should update all session keys in live bucket", func() {

		})

		It("keys should disappear without heartbeat", func() {

		})
	})

	Describe("NewAudience", func() {
		It("should create a new audience in live bucket", func() {

		})

		It("audience should disappear without heartbeat", func() {

		})

		It("audience should remain if heartbeat is received", func() {

		})
	})
})
