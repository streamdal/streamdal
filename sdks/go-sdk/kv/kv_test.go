package kv

import (
	"github.com/google/uuid"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/streamdal/go-sdk/logger/loggerfakes"
)

var _ = Describe("KV", func() {
	var kv IKV

	BeforeEach(func() {
		var err error
		kv, err = New(&Config{
			Logger: &loggerfakes.FakeLogger{},
		})
		Expect(err).To(BeNil())
	})

	Context("validateConfig", func() {
		It("should return an error if the config is nil", func() {
			err := validateConfig(nil)
			Expect(err).To(Equal(ErrNilConfig))
		})

		It("passes validation", func() {
			err := validateConfig(&Config{})
			Expect(err).To(BeNil())
		})
	})

	Context("set", func() {
		It("should return false if the key is already set", func() {
			overridden := kv.Set("foo", "value")
			Expect(overridden).To(BeFalse())
		})

		It("should return true if the key is already set", func() {
			kv.Set("foo", "value")
			overridden := kv.Set("foo", "value")
			Expect(overridden).To(BeTrue())
		})
	})

	Context("get", func() {
		It("should return false if the key is not set", func() {
			_, ok := kv.Get("foo")
			Expect(ok).To(BeFalse())
		})

		It("should return true if the key is set", func() {
			key := uuid.New().String()

			kv.Set(key, "value")
			val, ok := kv.Get(key)
			Expect(ok).To(BeTrue())
			Expect(val).To(Equal("value"))
		})
	})

	Context("delete", func() {
		It("should return false if the key is not set", func() {
			key := uuid.New().String()
			deleted := kv.Delete(key)
			Expect(deleted).To(BeFalse())
		})

		It("should return true if the key is set", func() {
			key := uuid.New().String()
			kv.Set(key, "value")
			deleted := kv.Delete(key)
			Expect(deleted).To(BeTrue())

			_, ok := kv.Get(key)
			Expect(ok).To(BeFalse())
		})
	})

	Context("exists", func() {
		It("should return false if the key is not set", func() {
			ok := kv.Exists(uuid.New().String())
			Expect(ok).To(BeFalse())
		})

		It("should return true if the key is set", func() {
			key := uuid.New().String()
			kv.Set(key, "value")
			ok := kv.Exists(key)
			Expect(ok).To(BeTrue())
		})
	})

	Context("keys", func() {
		It("should return a list of keys", func() {
			kv.Set(uuid.New().String(), "value")
			kv.Set(uuid.New().String(), "value")

			keys := kv.Keys()
			Expect(len(keys)).To(Equal(2))
		})
	})

	Context("items", func() {
		It("should return the number of items", func() {
			kv.Set(uuid.New().String(), "value")
			kv.Set(uuid.New().String(), "value")

			items := kv.Items()
			Expect(items).To(Equal(int64(2)))
		})
	})

	Context("purge", func() {
		It("should return the number of items", func() {
			kv.Set(uuid.New().String(), "value")
			kv.Set(uuid.New().String(), "value")

			purged := kv.Purge()
			Expect(purged).To(Equal(int64(2)))
		})
	})
})
