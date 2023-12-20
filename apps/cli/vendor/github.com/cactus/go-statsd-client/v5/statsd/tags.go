package statsd

type Tag [2]string
type TagFormat uint8

func (tf TagFormat) WriteInfix(data []byte, tags []Tag) []byte {
	switch {
	case tf&InfixComma != 0:
		for _, v := range tags {
			data = append(data, ',')
			data = append(data, v[0]...)
			data = append(data, '=')
			data = append(data, v[1]...)
		}
		return data
	case tf&InfixSemicolon != 0:
		for _, v := range tags {
			data = append(data, ';')
			data = append(data, v[0]...)
			data = append(data, '=')
			data = append(data, v[1]...)
		}
	}

	return data
}

func (tf TagFormat) WriteSuffix(data []byte, tags []Tag) []byte {
	switch {
	// make the zero value useful
	case tf == 0, tf&SuffixOctothorpe != 0:
		data = append(data, "|#"...)
		tlen := len(tags)
		for i, v := range tags {
			data = append(data, v[0]...)
			data = append(data, ':')
			data = append(data, v[1]...)
			if tlen > 1 && i < tlen-1 {
				data = append(data, ',')
			}
		}
	}

	return data
}

const (
	SuffixOctothorpe TagFormat = 1 << iota
	InfixSemicolon
	InfixComma

	AllInfix  = InfixSemicolon | InfixComma
	AllSuffix = SuffixOctothorpe
)
