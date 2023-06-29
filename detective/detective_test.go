package detective

import (
	"fmt"
	"testing"
	"time"

	"github.com/buger/jsonparser"
)

func TestMatch(t *testing.T) {
	m := NewMatcher()

	cases := []struct {
		input    string
		t        MatchType
		expected bool
	}{
		//{"4242424242424242", PIICreditCard, true},
		//{"4242-4242-4242-4242", PIICreditCard, true},
		{"192.168.1.20", IpAddress, true},
		{"2023-06-26T13:31:29Z", TimestampRFC3339, true},
		{"1257894000000000000", TimestampUnixNano, true},
		{"1687786289", TimestampUnix, true},
		{"true", BooleanTrue, true},
		{"false", BooleanFalse, true},
		{"", IsEmpty, true},
		{"200-81-6513", PIISSN, true},
		{"user@streamdal.com", PIIEmail, true},
		{"407-867-5309", PIIPhone, true},
	}

	for _, c := range cases {
		v, err := m.Match([]byte(c.input), jsonparser.String, c.t, IsMatch)
		if err != nil {
			t.Fatalf("Expected no error, got: '%s' for match '%s'", err, c.t)
		}

		if v != c.expected {
			t.Errorf("Expected %t, got: %t", c.expected, v)
		}
	}
}

func TestMatch_TimestampRFC3339(t *testing.T) {
	cases := []struct {
		arg      string
		duration time.Duration
		expected bool
	}{
		{"5", -30 * time.Second, true},
		{"5", 0, false},
	}

	m := NewMatcher()

	for _, c := range cases {
		val := time.Now().UTC().Add(c.duration).Format(time.RFC3339)
		res, err := m.Match([]byte(val), jsonparser.String, TimestampRFC3339, OlderThanSeconds, "5")
		if err != nil {
			t.Fatalf("Expected no error, got: '%s'", err)
		}
		if res != c.expected {
			t.Errorf("Expected '%t', got: '%t'", c.expected, res)
		}
	}
}

func TestMatch_TimestampISO8601(t *testing.T) {
	const FormatISO6801 = "2006-01-02T15:04:05-0700"

	cases := []struct {
		arg      string
		duration time.Duration
		expected bool
	}{
		{"5", -30 * time.Second, true},
		{"5", 0, false},
	}

	m := NewMatcher()

	for _, c := range cases {
		val := time.Now().UTC().Add(c.duration).Format(FormatISO6801)
		res, err := m.Match([]byte(val), jsonparser.String, TimestampISO8601, OlderThanSeconds, "5")
		if err != nil {
			t.Fatalf("Expected no error, got: '%s'", err)
		}
		if res != c.expected {
			t.Errorf("Expected '%t', got: '%t'", c.expected, res)
		}
	}
}

func TestMatch_TimestampUnix(t *testing.T) {
	cases := []struct {
		arg      string
		duration time.Duration
		expected bool
	}{
		{"5", -30 * time.Second, true},
		{"5", 0, false},
	}

	m := NewMatcher()

	for _, c := range cases {
		val := fmt.Sprintf("%d", time.Now().UTC().Add(c.duration).Unix())
		res, err := m.Match([]byte(val), jsonparser.String, TimestampUnix, OlderThanSeconds, c.arg)
		if err != nil {
			t.Fatalf("Expected no error, got: '%s'", err)
		}
		if res != c.expected {
			t.Errorf("Expected '%t', got: '%t'", c.expected, res)
		}
	}
}

func TestMatch_TimestampUnixNano(t *testing.T) {
	cases := []struct {
		arg      string
		duration time.Duration
		expected bool
	}{
		{"5", -30 * time.Second, true},
		{"5", 0, false},
	}

	m := NewMatcher()

	for _, c := range cases {
		val := fmt.Sprintf("%d", time.Now().UTC().Add(c.duration).UnixNano())
		res, err := m.Match([]byte(val), jsonparser.String, TimestampUnixNano, OlderThanSeconds, c.arg)
		if err != nil {
			t.Fatalf("Expected no error, got: '%s'", err)
		}
		if res != c.expected {
			t.Errorf("Expected '%t', got: '%t'", c.expected, res)
		}
	}
}
