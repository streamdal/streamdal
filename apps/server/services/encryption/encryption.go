package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"io"

	"github.com/pkg/errors"
)

type IEncryption interface {
	Encrypt(data []byte) ([]byte, error)
	Decrypt(data []byte) ([]byte, error)
}

type Encryption struct {
	key []byte
}

func New(key string) (*Encryption, error) {
	if err := validateKey(key); err != nil {
		return nil, errors.New("invalid encryption key")
	}

	decodedKey, err := hex.DecodeString(key)
	if err != nil {
		return nil, err
	}

	return &Encryption{key: decodedKey}, nil
}

// Encrypt encrypts data using an AES-256 key
func (e *Encryption) Encrypt(data []byte) ([]byte, error) {
	// Create a new Cipher Block from the key
	block, err := aes.NewCipher(e.key)
	if err != nil {
		return nil, errors.Wrap(err, "could not create cipher block from key")
	}

	// Create a new GCM - https://en.wikipedia.org/wiki/Galois/Counter_Mode
	// https://golang.org/pkg/crypto/cipher/#NewGCM
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, errors.Wrap(err, "could not create GCM from cipher block")
	}

	// Create a nonce. Nonce should be from GCM
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, errors.Wrap(err, "could not create nonce")
	}

	// Encrypt the data using aesGCM.Seal
	// Since we don't want to save the nonce somewhere else in this case, we add it as a prefix to the encrypted data. The first nonce argument in Seal is the prefix.
	ciphertext := aesGCM.Seal(nonce, nonce, data, nil)
	return ciphertext, nil
}

// Decrypt decrypts stored data
func (e *Encryption) Decrypt(data []byte) ([]byte, error) {
	// Create a new Cipher Block from the key
	block, err := aes.NewCipher(e.key)
	if err != nil {
		return nil, errors.Wrap(err, "could not create cipher block from key")
	}

	// Create a new GCM
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, errors.Wrap(err, "could not create GCM from cipher block")
	}

	// Get the nonce size
	nonceSize := aesGCM.NonceSize()

	// Extract the nonce from the encrypted data
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]

	// Decrypt the data
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, errors.Wrap(err, "could not decrypt data")
	}

	return plaintext, nil
}

// validateKey is called on every New() to validate that the key we have can be used
func validateKey(key string) error {
	testData := []byte(`{"data": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim 
id est laborum."}`)

	decodedKey, err := hex.DecodeString(key)
	if err != nil {
		return err
	}

	e := &Encryption{key: decodedKey}

	encrypted, err := e.Encrypt(testData)
	if err != nil {
		return err
	}

	decrypted, err := e.Decrypt(encrypted)
	if err != nil {
		return err
	}

	if string(decrypted) != string(testData) {
		return errors.New("decrypted data does not match original string")
	}

	return nil
}
