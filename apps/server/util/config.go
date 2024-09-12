package util

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/golang/protobuf/jsonpb"
	"github.com/pkg/errors"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
)

// CleanConfig removes values that should not be present in the response
// Values removed:
// - empty strings
// - false
// - empty objects
// - empty arrays
// Additionally, it this will also remove any WasmID and WasmFunction keys when there is no "custom"
// key in the same level. This is done to remove unnecessary wasm info that may not be importable after WASM
// modules get updated.
func CleanConfig(resp *protos.GetConfigResponse) ([]byte, error) {
	resp.Config.WasmModules = nil

	m := jsonpb.Marshaler{
		OrigName:     false,
		EnumsAsInts:  false,
		EmitDefaults: false,
		Indent:       "",
		AnyResolver:  nil,
	}

	data, err := m.MarshalToString(resp.Config)
	if err != nil {
		return nil, errors.Wrap(err, "unable to marshal config protobuf to JSON")
	}

	tmp := make(map[string]interface{})
	if err := json.Unmarshal([]byte(data), &tmp); err != nil {
		return nil, errors.Wrap(err, "unable to unmarshal config JSON for cleaning")
	}

	cleanEmptyValues(tmp)

	cleaned, err := json.Marshal(tmp)
	if err != nil {
		return nil, errors.Wrap(err, "unable to marshal config JSON after cleaning")
	}

	return cleaned, nil
}

func cleanEmptyValues(m map[string]interface{}) {
	for key, value := range m {
		switch v := value.(type) {
		// Object
		case map[string]interface{}:
			// Remove empty objects
			if len(v) == 0 {
				delete(m, key)
			} else {
				// Object, recurse into it
				cleanEmptyValues(v)
			}
		// Array
		case []interface{}:
			// Remove empty arrays
			if len(v) == 0 {
				delete(m, key)
				continue
			}

			// Loop over array and clean empty values from any subjects
			for _, item := range v {
				if itemMap, ok := item.(map[string]interface{}); ok {
					cleanEmptyValues(itemMap)
				}
			}
		// Scalar value: string, bool, number
		case interface{}:
			// Remove "false" boolean values
			if fmt.Sprintf("%t", v) == "false" {
				delete(m, key)
				continue
			}

			// Remove empty values
			if fmt.Sprintf("%s", v) == "" {
				delete(m, key)
				continue
			}

			// Remove WasmID and WasmFunction keys when there is no "custom" key in the same level
			// We do not want to include this information for non-custom wasm modules since it will
			// not be importable after wasm modules get updated.
			if strings.HasPrefix("WasmId", key) || strings.HasPrefix("WasmFunction", key) {
				if _, ok := m["custom"]; !ok {
					delete(m, key)
				}
			}
		}
	}
}
