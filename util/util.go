package util

import (
	"regexp"
	"strings"

	"github.com/gofrs/uuid"
)

var (
	SpaceRegex = regexp.MustCompile(`\s+`)
)

func GenerateUUID() string {
	v, err := uuid.NewV4()
	if err != nil {
		panic("unable to generate v4 uuid: " + err.Error())
	}

	return v.String()
}

func NormalizeString(s string) string {
	s = strings.ToLower(s)
	return SpaceRegex.ReplaceAllString(s, "-")
}
