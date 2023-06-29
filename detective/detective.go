package detective

import (
	"math"

	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/buger/jsonparser"
	"github.com/pkg/errors"
	regexp "github.com/wasilibs/go-re2"

	"github.com/streamdal/pii"
)

type MatchType string
type MatchOperator string

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
	TimestampISO8601  MatchType = "ts_iso8601"
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
	IsMatch          MatchOperator = "is_match"
	EqualTo          MatchOperator = "equal"
	GreaterThan      MatchOperator = "greater_than"
	GreaterEqual     MatchOperator = "greater_equal"
	LessThan         MatchOperator = "less_than"
	LessEqual        MatchOperator = "less_equal"
	OlderThanSeconds MatchOperator = "older_than_seconds"
)

type IMatcher interface {
	Match(val []byte, valT jsonparser.ValueType, matchT MatchType, op MatchOperator, args ...string) (bool, error)
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

func (m *Matcher) Match(val []byte, valT jsonparser.ValueType, matchT MatchType, op MatchOperator, args ...string) (bool, error) {
	// TODO: figure out integer matching

	strVal := string(val)

	// Accepting only a string for the field value to avoid having to type juggle all over the place
	// gJSON provides us with a string value of a field easily by calling .String()
	switch matchT {
	case IpAddress:
		return pii.IP()(strVal), nil
	case StringContainsAll:
		return matchStringAll(strVal, args...), nil
	case StringContainsAny:
		return matchStringAny(strVal, args...), nil
	case IsEmpty:
		return strings.Trim(strVal, " ") == "", nil
	case Regex:
		matched, err := m.matchRegex(strVal, args...)
		if err != nil {
			return false, err
		}
		return matched, nil
	case TimestampRFC3339:
		return matchTimestampRFC3339(strVal, op, args...)
	case TimestampISO8601:
		return matchTimestampISO8601(strVal, op, args...)
	case TimestampUnixNano:
		return matchTimestampUnixNano(strVal, op, args...)
	case TimestampUnix:
		return matchTimestampUnix(strVal, op, args...)
	case BooleanTrue:
		return strVal == "true", nil
	case BooleanFalse:
		return strVal == "false", nil
	case PII:
		return matchPII(strVal), nil
	case PIISSN:
		return pii.SSN()(strVal), nil
	case PIICreditCard:
		return pii.CreditCard()(strVal), nil
	case PIIEmail:
		return pii.Email()(strVal), nil
	case PIIPhone:
		return pii.Phone()(strVal), nil
	}

	return false, nil
}

func (m *Matcher) matchRegex(val string, args ...string) (bool, error) {
	if len(args) < 1 {
		return false, ErrNoRegexp
	}

	var regex *regexp.Regexp
	var ok bool

	expr := args[0]

	// Check cache first
	m.RegexCacheMutex.RLock()
	regex, ok = m.RegexCache[expr]
	m.RegexCacheMutex.RUnlock()
	if ok {
		return regex.MatchString(val), nil
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

	return r.MatchString(val), nil
}

func matchTimestampRFC3339(val string, op MatchOperator, args ...string) (bool, error) {
	if op != IsMatch && len(args) < 1 {
		return false, errors.New("missing argument")
	}

	tsValue, err := time.Parse(time.RFC3339, val)
	if err != nil {
		// Un-parsable, not a match
		return false, nil
	}
	if err == nil && op == IsMatch {
		// Only matching on format, not value
		return true, nil
	}

	// Argument is X number of seconds ago
	tsArg, err := time.ParseDuration(args[0] + "s")
	if err != nil {
		return false, errors.Wrap(err, "unable to parse argument into timestamp")
	}

	isOlder := tsValue.UTC().Before(time.Now().UTC().Add(-tsArg))

	return isOlder && op == OlderThanSeconds, nil
}

func matchTimestampISO8601(val string, op MatchOperator, args ...string) (bool, error) {
	if op != IsMatch && len(args) < 1 {
		return false, errors.New("missing argument")
	}

	formats := []string{
		"2006-01-02T15:04:05-0700",
		// TODO: this might need additional formats since ISO6801 covers a lot of ground:
		// TODO: https://ijmacd.github.io/rfc3339-iso8601/
	}

	// Argument is X number of seconds ago
	tsArg, err := time.ParseDuration(args[0] + "s")
	if err != nil {
		return false, errors.Wrap(err, "unable to parse argument into timestamp")
	}

	for _, format := range formats {
		tsValue, err := time.Parse(format, val)
		if err != nil {
			// Not a match, try next format
			continue
		}
		if err == nil && op == IsMatch {
			// Only matching on format, not value
			return true, nil
		}

		if tsValue.UTC().Before(time.Now().UTC().Add(-tsArg)) && op == OlderThanSeconds {
			return true, nil
		}
	}

	return false, nil
}

func matchTimestampUnix(val string, op MatchOperator, args ...string) (bool, error) {
	if op != IsMatch && len(args) < 1 {
		return false, errors.New("missing argument")
	}

	intValue, err := strconv.ParseInt(val, 10, 32)
	if err != nil {
		// Un-parsable, not a match
		return false, nil
	}
	if err == nil && op == IsMatch {
		// Only matching on format, not value
		return true, nil
	}

	// Argument is X number of seconds ago
	tsArg, err := time.ParseDuration(args[0] + "s")
	if err != nil {
		return false, errors.Wrap(err, "unable to parse argument into timestamp")
	}

	tsValue := time.Unix(intValue, 0)
	isOlder := tsValue.UTC().Before(time.Now().UTC().Add(-tsArg))

	// Guard the op here in case we add more in the future for timestamps
	// For now, return false if it is accidentally something else
	return isOlder && op == OlderThanSeconds, nil
}

func matchPII(val string) bool {
	match := pii.Any(
		pii.CreditCard(),
		pii.Address(),
		pii.BankInfo(),
		pii.VIN(),
		pii.Email(),
		pii.Phone(),
		pii.SSN(),
	)
	return match(val)
}

func matchStringAll(val string, matchArgs ...string) bool {
	if len(matchArgs) < 1 {
		return false
	}

	for _, arg := range matchArgs {
		if !strings.Contains(val, arg) {
			return false
		}
	}

	return true
}

func matchStringAny(val string, args ...string) bool {
	if len(args) < 1 {
		return false
	}

	for _, arg := range args {
		if strings.Contains(val, arg) {
			return true
		}
	}

	return false
}

func matchTimestampUnixNano(val string, op MatchOperator, args ...string) (bool, error) {
	if op != IsMatch && len(args) < 1 {
		return false, errors.New("missing argument")
	}

	intVal, err := strconv.ParseInt(val, 10, 64)
	if err != nil {
		// Un-parsable, not a match
		return false, nil
	}
	if err == nil && op == IsMatch {
		// Not sure if this is the correct behavior, but I'm assuming the user
		// would not want to mix up 32bit/64bit timestamps
		if intVal <= math.MaxInt32 {
			return true, nil
		}

		// Only matching on format, not value
		return true, nil
	}

	// Argument is X number of seconds ago
	tsArg, err := time.ParseDuration(args[0] + "s")
	if err != nil {
		return false, errors.Wrap(err, "unable to parse argument into timestamp")
	}

	tsValue := time.Unix(0, intVal)
	isOlder := tsValue.UTC().Before(time.Now().UTC().Add(-tsArg))

	// Guard the op here in case we add more in the future for timestamps
	// For now, return false if it is accidentally something else
	return isOlder && op == OlderThanSeconds, nil
}

func (m MatchType) String() string {
	return string(m)
}

// IsPIIMatcher returns true if the match type is looking for PII
// We use this to make sure _NOT_ to include the field's value in an alert message
func (m MatchType) IsPIIMatcher() bool {
	return strings.HasPrefix(m.String(), "pii")
}

//func matchNumeric(field []byte, dataType jsonparser.ValueType, matchType MatchType, matchArgs ...string) (bool, error) {
//	strVal := string(field)
//
//	// gjson returns the following:
//	// Floating points: gjson.Result{Type:2, Raw:"3.14159", Str:"", Num:3.14159, Index:7, Indexes:[]int(nil)}
//	// Integers: gjson.Result{Type:2, Raw:"12345", Str:"", Num:12345, Index:22, Indexes:[]int(nil)}
//	if strings.Contains(string(field), ".") {
//		floatVal, err := strconv.ParseFloat(strVal, 64)
//		if err != nil {
//			return false, errors.Wrap(err, "unable to parse float")
//		}
//
//		// Assume floating point
//		return matchFloat(floatVal, matchType, matchArgs...)
//	}
//
//	intVal, err := strconv.ParseInt(strVal, 10, 64)
//	if err != nil {
//		return false, errors.Wrap(err, "unable to parse int")
//	}
//
//	return matchInteger(intVal, matchType, matchArgs...)
//}
//
//func matchInteger(fieldValue int64, matchType MatchType, matchArgs ...string) (bool, error) {
//	args, err := sliceStringToInt(matchArgs)
//	if err != nil {
//		return false, err
//	}
//	if len(args) < 1 {
//		return false, errors.New("invalid rule: no argument to match against")
//	}
//
//	// Only expecting one argument in this method
//	switch matchType {
//	case GreaterEqual:
//		return fieldValue >= args[0], nil
//	case GreaterThan:
//		return fieldValue > args[0], nil
//	case LessThan:
//		return fieldValue < args[0], nil
//	case LessEqual:
//		return fieldValue <= args[0], nil
//	case EqualTo:
//		return fieldValue == args[0], nil
//	}
//
//	return false, fmt.Errorf("unknown numeric matcher: %s", matchType)
//}
//
//func matchFloat(fieldValue float64, matchType MatchType, matchArgs ...string) (bool, error) {
//	args, err := sliceStringToFloat(matchArgs)
//	if err != nil {
//		return false, err
//	}
//	if len(args) < 1 {
//		return false, errors.New("invalid rule: no argument to match against")
//	}
//
//	// Only expecting one argument in this method
//	switch matchType {
//	case GreaterEqual:
//		return fieldValue >= args[0], nil
//	case GreaterThan:
//		return fieldValue > args[0], nil
//	case LessThan:
//		return fieldValue < args[0], nil
//	case LessEqual:
//		return fieldValue <= args[0], nil
//	case EqualTo:
//		return fieldValue == args[0], nil
//	}
//
//	return false, fmt.Errorf("unknown numeric matcher: %s", matchType)
//}

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
