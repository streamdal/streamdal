package dataqual

import (
	"fmt"

	"github.com/pkg/errors"
	"github.com/wasmerio/wasmer-go/wasmer"
)

func writeMemory(inst *wasmer.Instance, data []byte, ptr int32) (*wasmer.Memory, error) {
	mem, err := inst.Exports.GetMemory("memory")
	if err != nil {
		return nil, fmt.Errorf("unable to get memory: %w", err)
	}

	copy(mem.Data()[ptr:], data)

	return mem, nil
}

func readMemory(memory []byte, ptr interface{}, length int) ([]byte, error) {
	if memory == nil {
		return nil, errors.New("memory cannot be nil")
	}

	// ptr should be an int32
	ptrInt32, ok := ptr.(int32)
	if !ok {
		return nil, fmt.Errorf("ptr should be an int32")
	}

	//fmt.Printf("Got ptr result: %d\n", ptrInt32)

	data := make([]byte, 0)
	nullHits := 0

	for i, v := range memory[ptrInt32:] {
		// Have length, can quit
		if length != -1 {
			if i == length {
				break
			}
		}

		if nullHits == 3 {
			break
		}

		// Don't have a length, have to see if we hit three null terminators (166)
		if v == 166 {
			nullHits++
			continue
		}

		// Got a null terminator, we are done
		//if v == 0 {
		//	break
		//}

		data = append(data, v)
	}

	return data, nil
}
