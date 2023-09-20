package kv

import (
	"testing"

	"github.com/google/uuid"

	"github.com/streamdal/snitch-go-client/logger/loggerfakes"
)

func newKV(t *testing.T) IKV {
	cfg := &Config{
		Logger: &loggerfakes.FakeLogger{},
	}
	kv, err := New(cfg)
	if err != nil {
		t.Error(err)
	}

	if kv == nil {
		t.Error("New() returned nil")
	}

	return kv
}

func TestValidateConfig(t *testing.T) {
	if err := validateConfig(nil); err != ErrNilConfig {
		t.Errorf("validateConfig() returned nil, expected error '%s'", ErrNilConfig.Error())
	}

	if err := validateConfig(&Config{}); err != nil {
		t.Errorf("validateConfig() returned error, expected nil: %s", err)
	}
}

func TestSet(t *testing.T) {
	kv := newKV(t)

	t.Run("key is not set yet", func(t *testing.T) {
		ok := kv.Set("foo", "value")
		if ok {
			t.Error("Set() returned false, expected true")
		}
	})

	t.Run("key is already set", func(t *testing.T) {
		kv.Purge()
		kv.Set("foo", "value")
		ok := kv.Set("foo", "value")
		if !ok {
			t.Error("Set() returned false, expected true")
		}
	})
}

func TestGet(t *testing.T) {
	kv := newKV(t)
	key := uuid.New().String()
	want := "value"

	t.Run("key is set", func(t *testing.T) {
		kv.Set(key, want)

		got, ok := kv.Get(key)
		if !ok {
			t.Error("Get() returned false, expected true")
		}

		if got != want {
			t.Errorf("Get() returned '%s', expected '%s'", got, want)
		}
	})

	t.Run("key is not set", func(t *testing.T) {
		got, ok := kv.Get(uuid.New().String())
		if ok {
			t.Error("Get() returned true, expected false")
		}

		if got != "" {
			t.Errorf("Get() returned '%s', expected empty string", got)
		}
	})

}

func TestDelete(t *testing.T) {
	kv := newKV(t)
	key := uuid.New().String()
	kv.Set(key, "value")

	if kv.Items() != 1 {
		t.Error("Expected 1 key to be in map")
	}

	ok := kv.Delete(key)
	if !ok {
		t.Error("Delete() returned false, expected true")
	}

	if kv.Items() != 0 {
		t.Error("Expected 0 keys to be in map")
	}
}

func TestExists(t *testing.T) {
	kv := newKV(t)
	key := uuid.New().String()
	kv.Set(key, "value")

	if ok := kv.Exists(uuid.New().String()); ok {
		t.Error("Exists() returned true, expected false")
	}

	if ok := kv.Exists(key); !ok {
		t.Error("Exiexts() returned false, expected true")
	}
}

func TestKeys(t *testing.T) {
	kv := newKV(t)
	kv.Set(uuid.New().String(), "value")
	kv.Set(uuid.New().String(), "value")

	keys := kv.Keys()
	if len(keys) != 2 {
		t.Errorf("Expected 2 keys, got '%d'", len(keys))
	}
}

func TestItems(t *testing.T) {
	kv := newKV(t)
	kv.Set(uuid.New().String(), "value")
	kv.Set(uuid.New().String(), "value")

	items := kv.Items()
	if items != 2 {
		t.Errorf("Expected 2 items, got '%d'", items)
	}
}

func TestPurge(t *testing.T) {
	kv := newKV(t)
	kv.Set(uuid.New().String(), "value")
	kv.Set(uuid.New().String(), "value")

	purged := kv.Purge()
	if purged != 2 {
		t.Errorf("Purge returned '%d', expected 2", purged)
	}
}
