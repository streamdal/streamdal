package encryption

type PlainText struct{}

func NewPlainText() *PlainText {
	return &PlainText{}
}

func (e *PlainText) Encrypt(data []byte) ([]byte, error) {
	return data, nil
}

func (e *PlainText) Decrypt(data []byte) ([]byte, error) {
	return data, nil
}
