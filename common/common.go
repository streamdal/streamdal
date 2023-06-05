package common

import (
	"unsafe"

	"github.com/streamdal/dataqual/detective"
)

//tinyjson:json
type MatchRequest struct {
	Data      []byte              `json:"data"`
	Path      string              `json:"path"`
	Args      []string            `json:"args"`
	MatchType detective.MatchType `json:"match_type"`
}

//tinyjson:json
type TransformRequest struct {
	Data   []byte `json:"data"`
	Path   string `json:"path"`
	Value  string `json:"value"`
	Delete bool   `json:"delete"`
}

//tinyjson:json
type MatchResponse struct {
	IsMatch bool
	Error   string
}

//tinyjson:json
type TransformResponse struct {
	Data  []byte
	Error string
}

// Terminator sequence is 3 broken pipe characters
var terminator = []byte{166, 166, 166}

func ReturnMatchResponse(valid bool, err error) int32 {
	resp := &MatchResponse{
		IsMatch: valid,
		Error:   "",
	}

	if err != nil {
		resp.IsMatch = false
		resp.Error = err.Error()
	}

	// Serialize response
	returnData, err := resp.MarshalJSON()
	if err != nil {
		errRet := []byte("")
		return *(*int32)(unsafe.Pointer(&errRet))
	}

	// Add terminator sequence
	returnData = append(returnData, terminator...)

	return *(*int32)(unsafe.Pointer(&returnData))
}

func ReturnTransformResponse(data []byte, err error) int32 {
	resp := &TransformResponse{
		Data:  data,
		Error: "",
	}

	if err != nil {
		resp.Error = err.Error()
	}

	// Serialize response
	returnData, err := resp.MarshalJSON()
	if err != nil {
		errRet := []byte("")
		return *(*int32)(unsafe.Pointer(&errRet))
	}

	// Add terminator sequence
	returnData = append(returnData, terminator...)

	return *(*int32)(unsafe.Pointer(&returnData))
}
