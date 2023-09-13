// Package base58 provides the APIs for encoding and decoding base58 strings.
package base58

import (
	"fmt"
	"strconv"
)

// An Encoding is a radix 58 encoding/decoding scheme.
type Encoding struct {
	alphabet  [58]byte
	decodeMap [256]int64
}

// New creates a new base58 encoding.
func New(alphabet []byte) *Encoding {
	enc := &Encoding{}
	copy(enc.alphabet[:], alphabet)
	for i := range enc.decodeMap {
		enc.decodeMap[i] = -1
	}
	for i, b := range enc.alphabet {
		enc.decodeMap[b] = int64(i)
	}
	return enc
}

// FlickrEncoding is the encoding scheme used for Flickr's short URLs.
var FlickrEncoding = New([]byte("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"))

// RippleEncoding is the encoding scheme used for Ripple addresses.
var RippleEncoding = New([]byte("rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz"))

// BitcoinEncoding is the encoding scheme used for Bitcoin addresses.
var BitcoinEncoding = New([]byte("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"))

const (
	radix    = uint64(58)
	slice    = 17                 // radix * 10^slice < math.MaxUint64
	overflow = 100000000000000000 // 10^slice
)

type encodeError []byte

func (err encodeError) Error() string {
	return fmt.Sprintf("expecting a non-negative number but got %q", []byte(err))
}

// Encode encodes the number represented in the byte slice base 10.
func (enc *Encoding) Encode(src []byte) ([]byte, error) {
	buf := make([]byte, len(src))
	var zerocnt int
	for _, c := range src {
		if c == '0' {
			zerocnt++
		} else {
			break
		}
	}
	if len(src)-zerocnt < 20 { // 10^19 < math.MaxUint64 < 10^20
		n, err := parseUint64(src[zerocnt:])
		if err != nil {
			return nil, err
		}
		buf, i := enc.appendEncodeUint64(buf, n)
		for ; zerocnt > 0; zerocnt-- {
			i--
			buf[i] = enc.alphabet[0]
		}
		return buf[i:], nil
	}
	xs := make([]uint64, (len(src)+(slice-1))/slice)
	j, k := len(src)-slice, len(src)
	var err error
	for i := len(xs) - 1; i >= 0; i-- {
		if j < 0 {
			j = 0
		}
		xs[i], err = parseUint64(src[j:k])
		if err != nil {
			return nil, encodeError(src)
		}
		j, k = j-slice, j
	}
	i := len(buf)
	for len(xs) > 1 || xs[0] > 0 {
		for j, x := range xs {
			if x != 0 {
				if j > 0 {
					xs = xs[j:]
				}
				break
			}
		}
		var mod uint64
		for j, x := range xs {
			if j > 0 {
				x += mod * overflow
			}
			xs[j], mod = x/radix, x%radix
		}
		i--
		buf[i] = enc.alphabet[int(mod)]
	}
	for ; zerocnt > 0; zerocnt-- {
		i--
		buf[i] = enc.alphabet[0]
	}
	return buf[i:], nil
}

// EncodeUint64 encodes the unsigned integer.
func (enc *Encoding) EncodeUint64(n uint64) []byte {
	if n == 0 {
		return []byte{enc.alphabet[0]}
	}
	buf, i := enc.appendEncodeUint64(make([]byte, 11), n)
	return buf[i:]
}

func (enc *Encoding) appendEncodeUint64(buf []byte, n uint64) ([]byte, int) {
	i := len(buf)
	var mod uint64
	for n > 0 {
		n, mod = n/radix, n%radix
		i--
		buf[i] = enc.alphabet[mod]
	}
	return buf, i
}

// Decode decodes the base58 encoded bytes.
func (enc *Encoding) Decode(src []byte) ([]byte, error) {
	if len(src) == 0 {
		return []byte{}, nil
	}
	buf := make([]byte, 0, len(src)*2)
	for i, c := range src {
		if c == enc.alphabet[0] && i < len(src)-1 {
			buf = append(buf, '0')
		} else {
			break
		}
	}
	if len(src[len(buf):]) < 11 { // 58^10 < math.MaxUint64 < 58^11
		n, err := enc.DecodeUint64(src[len(buf):])
		if err != nil {
			return nil, err
		}
		return strconv.AppendUint(buf, n, 10), nil
	}
	xs := make([]uint64, 0, len(src)/9+1) // > log_{overflow}(58^len(src))+1
	var i int64
	for _, c := range src {
		if i = enc.decodeMap[c]; i < 0 {
			return nil, fmt.Errorf("invalid character '%c' in decoding a base58 string %q", c, src)
		}
		carry := uint64(i)
		for j, x := range xs {
			if x = x*radix + carry; x < overflow {
				xs[j], carry = x, 0
			} else {
				xs[j], carry = x%overflow, x/overflow
			}
		}
		if carry > 0 {
			xs = append(xs, carry)
		}
	}
	for i := len(xs) - 1; i >= 0; i-- {
		x := xs[i]
		if i < len(xs)-1 {
			for k := uint64(overflow / 10); x < k && 1 < k; k /= 10 {
				buf = append(buf, '0')
			}
		}
		buf = strconv.AppendUint(buf, x, 10)
	}
	return buf, nil
}

// DecodeUint64 decodes the base58 encoded bytes to an unsigned integer.
func (enc *Encoding) DecodeUint64(src []byte) (uint64, error) {
	var n, m uint64
	var i int64
	for _, c := range src {
		if i = enc.decodeMap[c]; i < 0 {
			return 0, fmt.Errorf("invalid character '%c' in decoding a base58 string %q", c, src)
		}
		m = n*radix + uint64(i)
		if m < n {
			return 0, fmt.Errorf("overflow in decoding a base58 string %q", src)
		}
		n = m
	}
	return n, nil
}

// UnmarshalFlag implements flags.Unmarshaler
func (enc *Encoding) UnmarshalFlag(value string) error {
	switch value {
	case "flickr":
		*enc = *FlickrEncoding
	case "ripple":
		*enc = *RippleEncoding
	case "bitcoin":
		*enc = *BitcoinEncoding
	default:
		return fmt.Errorf("unknown encoding: %s", value)
	}
	return nil
}

func parseUint64(src []byte) (uint64, error) {
	var n uint64
	for _, c := range src {
		if '0' <= c && c <= '9' {
			n = n*10 + uint64(c&0xF)
		} else {
			return 0, encodeError(src)
		}
	}
	return n, nil
}
