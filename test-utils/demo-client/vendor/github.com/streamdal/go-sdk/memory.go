package streamdal

import "fmt"

// TODO: allow 166 inside of the string
func (f *function) ReadMemory(ptr uint32, length int) ([]byte, error) {
	data := make([]byte, 0)
	nullHits := 0

	if length > 0 {
		mem, ok := f.Inst.Memory().Read(ptr, uint32(length))
		if !ok {
			return nil, fmt.Errorf("unable to read memory at '%d' with length '%d'", ptr, length)
		}

		return mem, nil
	}

	for {
		v, ok := f.Inst.Memory().ReadByte(ptr)
		if !ok {
			return data, nil
		}

		ptr++

		// Don't have a length, have to see if we hit three null terminators (166)
		if v == 166 {
			nullHits++
			continue
		}

		if nullHits == 3 {
			break
		}

		data = append(data, v)
	}

	return data, nil
}
