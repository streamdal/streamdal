package detective

import (
	"testing"

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
		{"2023-06-26T13:31:29+00:00", TimestampRFC3339, true},
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
		op       MatchOperator
		input    string
		arg      string
		expected bool
	}{
		{GreaterThan, "2023-06-26T13:31:29+00:00", "2023-06-25T13:31:29+00:00", true},
		{GreaterEqual, "2023-06-26T13:31:29+00:00", "2023-06-26T13:31:29+00:00", true},
		{LessThan, "2023-06-25T13:31:29+00:00", "2023-06-26T13:31:29+00:00", true},
		{LessEqual, "2023-06-26T13:31:29+00:00", "2023-06-26T13:31:29+00:00", true},
		{EqualTo, "2023-06-26T13:31:29+00:00", "2023-06-26T13:31:29+00:00", true},
	}

	m := NewMatcher()

	for _, c := range cases {
		v, err := m.Match([]byte(c.input), jsonparser.String, TimestampRFC3339, c.op, c.arg)
		if err != nil {
			t.Fatalf("Expected no error, got: '%s' for match '%s'", err, TimestampRFC3339)
		}

		if v != c.expected {
			t.Errorf("Expected %t, got: %t", c.expected, v)
		}
	}
}

func TestMatch_TimestampISO8601(t *testing.T) {
	cases := []struct {
		op       MatchOperator
		input    string
		arg      string
		expected bool
	}{
		{GreaterThan, "2023-06-26T13:31:29+0000", "2023-06-25T13:31:29+0000", true},
		{GreaterEqual, "2023-06-26T13:31:29+0000", "2023-06-26T13:31:29+0000", true},
		{LessThan, "2023-06-25T13:31:29+0000", "2023-06-26T13:31:29+0000", true},
		{LessEqual, "2023-06-26T13:31:29+0000", "2023-06-26T13:31:29+0000", true},
		{EqualTo, "2023-06-26T13:31:29+0000", "2023-06-26T13:31:29+0000", true},
	}

	m := NewMatcher()

	for _, c := range cases {
		v, err := m.Match([]byte(c.input), jsonparser.String, TimestampISO8601, c.op, c.arg)
		if err != nil {
			t.Fatalf("Expected no error, got: '%s' for match '%s'", err, TimestampISO8601)
		}

		if v != c.expected {
			t.Errorf("Expected %t, got: %t", c.expected, v)
		}
	}
}

func TestMatch_TimestampUnix(t *testing.T) {
	cases := []struct {
		op       MatchOperator
		input    string
		arg      string
		expected bool
	}{
		{GreaterThan, "1257894000000000000", "1257893000000000000", true},
		{GreaterEqual, "1257894000000000000", "1257894000000000000", true},
		{LessThan, "1257893000000000000", "1257894000000000000", true},
		{LessEqual, "1257894000000000000", "1257894000000000000", true},
		{EqualTo, "1257894000000000000", "1257894000000000000", true},
	}

	m := NewMatcher()

	for _, c := range cases {
		v, err := m.Match([]byte(c.input), jsonparser.String, TimestampUnixNano, c.op, c.arg)
		if err != nil {
			t.Fatalf("Expected no error, got: '%s' for match '%s'", err, TimestampUnixNano)
		}

		if v != c.expected {
			t.Errorf("Expected %t, got: %t", c.expected, v)
		}
	}
}

func TestMatch_TimestampUnixNano(t *testing.T) {
	cases := []struct {
		op       MatchOperator
		input    string
		arg      string
		expected bool
	}{
		{GreaterThan, "1687886766", "1687886755", true},
		{GreaterEqual, "1687886766", "1687886766", true},
		{LessThan, "1687886755", "1687886766", true},
		{LessEqual, "1687886766", "1687886766", true},
		{EqualTo, "1687886766", "1687886766", true},
	}

	m := NewMatcher()

	for _, c := range cases {
		v, err := m.Match([]byte(c.input), jsonparser.String, TimestampUnixNano, c.op, c.arg)
		if err != nil {
			t.Fatalf("Expected no error, got: '%s' for match '%s'", err, TimestampUnixNano)
		}

		if v != c.expected {
			t.Errorf("Expected %t, got: %t", c.expected, v)
		}
	}
}
