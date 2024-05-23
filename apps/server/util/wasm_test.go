package util

import (
	"fmt"
	"os"
	"testing"
)

func Test_Precompile(t *testing.T) {
	uncompiled, err := os.ReadFile("../assets/wasm/detective.wasm")
	if err != nil {
		t.Fatal(err)
	}

	result, err := PrecompileWasm(uncompiled)
	if err != nil {
		t.Fatal(err)
	}

	fmt.Printf("Precompiled: %v\n", result)
}
