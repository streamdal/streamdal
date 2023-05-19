package pii

// Matcher is an evaluation type
type Matcher func(string) bool

// Not is the logical negation of a Matcher
func Not(f Matcher) Matcher {
	return func(s string) bool {
		return !f(s)
	}
}

// All returns a meta-matcher that requires all supplied matchers evaluate to true
func All(funcs ...Matcher) Matcher {
	return AtLeastN(len(funcs), funcs...)
}

// And creates a meta matcher for requiring a logical AND between supplied matchers
func And(a, b Matcher) Matcher {
	return All(a, b)
}

// Any creates a meta matcher for any possible hits against a set of matchers
func Any(funcs ...Matcher) Matcher {
	return AtLeastN(1, funcs...)
}

// Or creates a meta matcher for performing a logical OR on two matchers
func Or(a, b Matcher) Matcher {
	return Any(a, b)
}

// AtLeastN creates an at least n rule against a set of matchers
func AtLeastN(n int, funcs ...Matcher) Matcher {
	if n < 1 {
		n = 1
	}
	if n > len(funcs) {
		n = len(funcs)
	}
	return func(s string) bool {
		passes, fails := 0, 0
		for _, f := range funcs {
			if f(s) {
				passes++
			} else {
				fails++
			}
			if len(funcs)-fails < n {
				return false
			}
			if passes >= n {
				return true
			}
		}
		return false
	}
}

// Phone returns a matcher for identifying international phone numbers
func Phone() Matcher {
	return And(
		Any(
			matchphone,
			matchphonesWithExts,
		),
		Not(
			Any(
				matchemail,
				matchfilename,
				//matchrepeatingnumber, -- breaks on tinygo
				matchluhn,
			),
		),
	)
}

// Link returns a matcher for identifying URLs and links that are not emails
func Link() Matcher {
	return And(
		Any(
			// matchlink,
			matchurl,
		),
		Not(
			matchemail,
		),
	)
}

// SSN returns a matcher for identifying US social security numbers
func SSN() Matcher {
	return And(
		matchssn,
		All(
			Not(matchphone),
			Not(matchfilename),
			//Not(matchrepeatingnumber), -- Breaks on tinygo
		),
	)
}

// Email returns a matcher for identifying email addresses
func Email() Matcher {
	return matchemail
}

// IP returns a matcher for identifying IP addresses
func IP() Matcher {
	return Any(
		matchipv4,
		matchipv6,
	)
}

// CreditCard returns a matcher for identifying major credit card numbers
func CreditCard() Matcher {
	return And(
		Any(
			matchluhn,
			matchcreditCard,
			//matchaltcreditcard, -- Breaks on tinygo
		),
		All(
			Not(matchuuid),
			//Not(matchrepeatingnumber),
			// Not(matchfilename),
			// Not(matchphone),
			Not(matchtestcreditcard),
		),
	)
}

// Address returns a matcher for identifying street address, po boxes, and zip codes
func Address() Matcher {
	return And(
		Any(
			matchstreetAddress,
			matchpoBox,
		),
		matchzipCode,
	)
}

// BankInfo returns a matcher for identifying either IBANs or US Routing #s
func BankInfo() Matcher {
	return Any(
		matchiban,
		matchusbankrouting,
	)

	// matchrepeatingnumber breaks on tinygo
	//return And(
	//	Any(
	//		matchiban,
	//		matchusbankrouting,
	//	),
	//	Not(matchrepeatingnumber),
	//)
}

// UUID returns a matcher for identifying GUIDs, UUIDs, v3, v4, and v5
func UUID() Matcher {
	return And(
		Any(
			matchguid,
			matchuuid,
			matchuuid3,
			matchuuid4,
			matchuuid5,
		),
		Not(
			matchfilename,
		),
	)
}

// VIN generates a matcher for identifying vehicle identification numbers
func VIN() Matcher {
	return All(
		matchvin,
		Not(matchfilename),
		//Not(matchrepeatingnumber), -- Breaks on tinygo
		Not(matchemail),
	)
}

// HaltLangDetect is a special matcher for preventing language detection from running
func HaltLangDetect() Matcher {
	return Any(
		UUID(),
		Link(),
		Email(),
		CreditCard(),
	)
}
