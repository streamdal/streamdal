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
		{"4242424242424242", PIICreditCard, true},
		{"4242-4242-4242-4242", PIICreditCard, true},
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
		v, err := m.Match([]byte(c.input), jsonparser.String, c.t)
		if err != nil {
			t.Fatalf("Expected no error, got: %s", err)
		}

		if v != c.expected {
			t.Errorf("Expected %t, got: %t", c.expected, v)
		}
	}
}
