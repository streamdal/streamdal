package common

//tinyjson:json
type Request struct {
	Data []byte            `json:"data"`
	Path string            `json:"path"`
	Args map[string]string `json:"args"`
}

//tinyjson:json
type Response struct {
	Data  []byte
	Valid bool
	Error string
}
