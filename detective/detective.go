package detective

import (
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/buger/jsonparser"
	"github.com/pkg/errors"
	"github.com/streamdal/pii"
	"github.com/tidwall/gjson"
)

type MatchType string

var (
	ErrNoRegexp = errors.New("No regular expression supplied")
)

const (
	StringContainsAny MatchType = "string_contains_any"
	StringContainsAll MatchType = "string_contains_all"
	IpAddress         MatchType = "ip_address"
	Regex             MatchType = "regex"
	TimestampRFC3339  MatchType = "ts_rfc3339"
	TimestampUnixNano MatchType = "ts_unix_nano"
	TimestampUnix     MatchType = "ts_unix"
	BooleanTrue       MatchType = "true"
	BooleanFalse      MatchType = "false"
	IsEmpty           MatchType = "is_empty"

	// PII will match any PII we are capable of detecting.
	// The more specific types are included for convenience, in the event
	// that the user wants to specifically match them.
	PII           MatchType = "pii"
	PIICreditCard MatchType = "pii_creditcard"
	PIISSN        MatchType = "pii_ssn"
	PIIEmail      MatchType = "pii_email"
	PIIPhone      MatchType = "pii_phone"

	// TODO: implement logical operators at some point
	EqualTo      MatchType = "equal"
	GreaterThan  MatchType = "greater_than"
	GreaterEqual MatchType = "greater_equal"
	LessThan     MatchType = "less_than"
	LessEqual    MatchType = "less_equal"
)

type IMatcher interface {
	Match(fieldValue *gjson.Result, matchType MatchType, matchArgs ...string) (bool, error)
}

type Matcher struct {
	RegexCacheMutex *sync.RWMutex
	RegexCache      map[string]*regexp.Regexp
}

func NewMatcher() *Matcher {
	return &Matcher{
		RegexCacheMutex: &sync.RWMutex{},
		RegexCache:      make(map[string]*regexp.Regexp),
	}
}

func (m *Matcher) Match(field []byte, dataType jsonparser.ValueType, matchType MatchType, matchArgs ...string) (bool, error) {
	switch matchType {
	case GreaterThan:
		fallthrough
	case GreaterEqual:
		fallthrough
	case LessThan:
		fallthrough
	case LessEqual:
		fallthrough
	case EqualTo:
		return matchNumeric(field, dataType, matchType, matchArgs...)
	default:
		return m.matchString(string(field), matchType, matchArgs...)
	}
}

func (m *Matcher) matchString(fieldValue string, matchType MatchType, matchArgs ...string) (bool, error) {
	// Accepting only a string for the field value to avoid having to type juggle all over the place
	// gJSON provides us with a string value of a field easily by calling .String()
	switch matchType {
	case IpAddress:
		return pii.IP()(fieldValue), nil
	case StringContainsAll:
		return matchStringAll(fieldValue, matchArgs...), nil
	case StringContainsAny:
		return matchStringAny(fieldValue, matchArgs...), nil
	case IsEmpty:
		return strings.Trim(fieldValue, " ") == "", nil
	case Regex:
		matched, err := m.matchRegex(fieldValue, matchArgs...)
		if err != nil {
			return false, err
		}
		return matched, nil
	case TimestampRFC3339:
		return matchTimestampRFC3339(fieldValue), nil
	case TimestampUnixNano:
		return matchTimestampUnixNano(fieldValue), nil
	case TimestampUnix:
		return matchTimestampUnix(fieldValue), nil
	case BooleanTrue:
		return fieldValue == "true", nil
	case BooleanFalse:
		return fieldValue == "false", nil
	case PII:
		return matchPII(fieldValue), nil
	case PIISSN:
		return pii.SSN()(fieldValue), nil
	case PIICreditCard:
		return pii.CreditCard()(fieldValue), nil
	case PIIEmail:
		return pii.Email()(fieldValue), nil
	case PIIPhone:
		return pii.Phone()(fieldValue), nil
	}

	return false, nil
}

func (m *Matcher) matchRegex(fieldValue string, matchArgs ...string) (bool, error) {
	if len(matchArgs) < 1 {
		return false, ErrNoRegexp
	}

	var regex *regexp.Regexp
	var ok bool

	expr := matchArgs[0]

	// Check cache first
	m.RegexCacheMutex.RLock()
	regex, ok = m.RegexCache[expr]
	m.RegexCacheMutex.RUnlock()
	if ok {
		return regex.MatchString(fieldValue), nil
	}

	// Compile and store in cache
	r, err := regexp.Compile(expr)
	if err != nil {
		return false, errors.Wrap(err, "unable to compile regex")
	}

	// Cache so we don't have to take a compilation hit again
	m.RegexCacheMutex.Lock()
	m.RegexCache[expr] = r
	m.RegexCacheMutex.Unlock()

	return r.MatchString(fieldValue), nil
}

func matchTimestampRFC3339(fieldValue string) bool {
	_, err := time.Parse(time.RFC3339, fieldValue)
	return err == nil
}

func matchTimestampUnix(fieldValue string) bool {
	_, err := strconv.ParseInt(fieldValue, 10, 32)
	return err == nil
}

func matchPII(fieldValue string) bool {
	match := pii.Any(
		pii.CreditCard(),
		pii.Address(),
		pii.BankInfo(),
		pii.VIN(),
		pii.Email(),
		pii.Phone(),
		pii.SSN(),
	)
	return match(fieldValue)
}

func matchStringAll(fieldValue string, matchArgs ...string) bool {
	if len(matchArgs) < 1 {
		return false
	}

	for _, arg := range matchArgs {
		if !strings.Contains(fieldValue, arg) {
			return false
		}
	}

	return true
}

func matchStringAny(fieldValue string, matchArgs ...string) bool {
	if len(matchArgs) < 1 {
		return false
	}

	for _, arg := range matchArgs {
		if strings.Contains(fieldValue, arg) {
			return true
		}
	}

	return false
}

func matchTimestampUnixNano(fieldValue string) bool {
	// Expecting a string for all args to make things simple
	// Convert to int64
	v, err := strconv.ParseInt(fieldValue, 10, 64)
	if err != nil {
		return false
	}

	// Not sure if this is the correct behavior, but I'm assuming the user
	// would not want to mix up 32bit/64bit timestamps
	if v <= math.MaxInt32 {
		return false
	}

	return v == time.Unix(0, v).UnixNano()
}

func (m MatchType) String() string {
	return string(m)
}

// IsPIIMatcher returns true if the match type is looking for PII
// We use this to make sure _NOT_ to include the field's value in an alert message
func (m *MatchType) IsPIIMatcher() bool {
	return strings.HasPrefix(m.String(), "pii")
}

func matchNumeric(field []byte, dataType jsonparser.ValueType, matchType MatchType, matchArgs ...string) (bool, error) {
	strVal := string(field)

	// gjson returns the following:
	// Floating points: gjson.Result{Type:2, Raw:"3.14159", Str:"", Num:3.14159, Index:7, Indexes:[]int(nil)}
	// Integers: gjson.Result{Type:2, Raw:"12345", Str:"", Num:12345, Index:22, Indexes:[]int(nil)}
	if strings.Contains(string(field), ".") {
		floatVal, err := strconv.ParseFloat(strVal, 64)
		if err != nil {
			return false, errors.Wrap(err, "unable to parse float")
		}

		// Assume floating point
		return matchFloat(floatVal, matchType, matchArgs...)
	}

	intVal, err := strconv.ParseInt(strVal, 10, 64)
	if err != nil {
		return false, errors.Wrap(err, "unable to parse int")
	}

	return matchInteger(intVal, matchType, matchArgs...)
}

func matchInteger(fieldValue int64, matchType MatchType, matchArgs ...string) (bool, error) {
	args, err := sliceStringToInt(matchArgs)
	if err != nil {
		return false, err
	}
	if len(args) < 1 {
		return false, errors.New("invalid rule: no argument to match against")
	}

	// Only expecting one argument in this method
	switch matchType {
	case GreaterEqual:
		return fieldValue >= args[0], nil
	case GreaterThan:
		return fieldValue > args[0], nil
	case LessThan:
		return fieldValue < args[0], nil
	case LessEqual:
		return fieldValue <= args[0], nil
	case EqualTo:
		return fieldValue == args[0], nil
	}

	return false, fmt.Errorf("unknown numeric matcher: %s", matchType)
}

func matchFloat(fieldValue float64, matchType MatchType, matchArgs ...string) (bool, error) {
	args, err := sliceStringToFloat(matchArgs)
	if err != nil {
		return false, err
	}
	if len(args) < 1 {
		return false, errors.New("invalid rule: no argument to match against")
	}

	// Only expecting one argument in this method
	switch matchType {
	case GreaterEqual:
		return fieldValue >= args[0], nil
	case GreaterThan:
		return fieldValue > args[0], nil
	case LessThan:
		return fieldValue < args[0], nil
	case LessEqual:
		return fieldValue <= args[0], nil
	case EqualTo:
		return fieldValue == args[0], nil
	}

	return false, fmt.Errorf("unknown numeric matcher: %s", matchType)
}

// sliceStringToFloat takes a slice of match arguments which will be strings, and converts
// them to float64 for use with arithmetic comparisons
func sliceStringToFloat(args []string) ([]float64, error) {
	ret := make([]float64, 0)
	for _, str := range args {
		fv, err := strconv.ParseFloat(str, 64)
		if err != nil {
			return nil, errors.Wrapf(err, "unable to convert '%s' to a float", str)
		}

		ret = append(ret, fv)
	}
	return ret, nil
}

func sliceStringToInt(args []string) ([]int64, error) {
	ret := make([]int64, 0)
	for _, str := range args {
		fv, err := strconv.ParseInt(str, 10, 32)
		if err != nil {
			return nil, errors.Wrapf(err, "unable to convert '%s' to a int", str)
		}

		ret = append(ret, fv)
	}
	return ret, nil
}
