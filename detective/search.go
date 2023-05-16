package detective

import (
	"errors"
	"strconv"
	"strings"

	"github.com/tidwall/gjson"
)

var (
	ErrFieldNotFound = errors.New("field not found")
	ErrEmptyQuery    = errors.New("empty query")
)

func GetFieldValue(input []byte, path string) ([]*gjson.Result, error) {
	// Since we might deal with arrays, we need to handle multiple responses
	// This is the best way I can think of at the moment unless we want to
	// implement a custom response struct. Monitor service will just have to
	// handle multiple possible results, which I think is fine
	accumulator := make([]*gjson.Result, 0)

	// TODO: 🤠 need some proper parsing eventually, since field names might have a dot
	query := strings.Split(path, ".")

	if err := walkJson(gjson.ParseBytes(input), query, &accumulator); err != nil {
		return nil, err
	}

	if len(accumulator) == 0 {
		return nil, ErrFieldNotFound
	}

	return accumulator, nil
}

// walkJson is a recursive function which talks through a JSON object and attempts to find a field based
// on a comma-delimited path
func walkJson(result gjson.Result, query []string, accumulator *[]*gjson.Result) error {
	var err error

	result.ForEach(func(key, value gjson.Result) bool {
		// Safety check
		if len(query) == 0 {
			err = ErrEmptyQuery
			return false // exit ForEach()
		}

		if strings.ToLower(key.String()) != strings.ToLower(query[0]) {
			// Go onto next key
			return true
		}

		// We're on the right path, keep diving into this key
		if value.IsObject() {
			if err = walkJson(value, query[1:], accumulator); err != nil {
				return false // exit ForEach()
			}
		} else if value.IsArray() {
			if err = walkArray(value, query[1:], accumulator); err != nil {
				return false // exit ForEach()
			}
		} else {
			*accumulator = append(*accumulator, &value)
			return false // exit ForEach()
		}

		return true

	})

	return err
}

func walkArray(result gjson.Result, query []string, accumulator *[]*gjson.Result) error {
	var err error

	// Looking for any element in this array
	if query[0] == "[]" {
		result.ForEach(func(key, value gjson.Result) bool {
			if value.IsArray() {
				// Array inside of an array. Ex: [['a'], ['b']]
				if err = walkArray(value, query[1:], accumulator); err != nil {
					return false // exit ForEach()
				}
			} else if value.IsObject() {
				// Objects inside of an array: [{key: "Val"}]
				if err = walkJson(value, query[1:], accumulator); err != nil {
					// Break out of ForEach()
					return false
				}
			} else {
				*accumulator = append(*accumulator, &value)
			}

			return true
		})

		return err
	}

	// Looking for a specific index of this array
	if strings.HasPrefix(query[0], "[") && strings.HasSuffix(query[0], "]") {
		var currentIdx int

		r := strings.NewReplacer("[", "", "]", "")
		// Specific element check
		foundIdx := r.Replace(query[0])

		idx, idxErr := strconv.Atoi(foundIdx)
		if err != nil {
			return idxErr
		}

		result.ForEach(func(key, value gjson.Result) bool {
			if idx != currentIdx {
				currentIdx++
				return true
			}

			// Found the element we're looking for
			if value.IsArray() {
				// Array inside of an array. Ex: [['a'], ['b']]
				if err = walkArray(value, query[1:], accumulator); err != nil {
					return false
				}
			} else if value.IsObject() {
				// Objects inside of an array: [{key: "Val"}]
				if err = walkJson(value, query[1:], accumulator); err != nil {
					return false
				}
			} else {
				*accumulator = append(*accumulator, &value)
				return false // exit ForEach()
			}

			return true
		})
	}

	return err
}
