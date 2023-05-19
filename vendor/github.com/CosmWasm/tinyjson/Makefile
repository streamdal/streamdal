all: test

clean:
	rm -rf bin
	rm -rf tests/*_tinyjson.go
	rm -rf benchmark/*_tinyjson.go

build:
	go build -o ./bin/tinyjson ./tinyjson

generate: build
	bin/tinyjson -stubs \
		./tests/snake.go \
		./tests/data.go \
		./tests/omitempty.go \
		./tests/nothing.go \
		./tests/named_type.go \
		./tests/custom_map_key_type.go \
		./tests/embedded_type.go \
		./tests/reference_to_pointer.go \
		./tests/html.go \
		./tests/unknown_fields.go \
		./tests/type_declaration.go \
		./tests/type_declaration_skip.go \
		./tests/members_escaped.go \
		./tests/members_unescaped.go \
		./tests/intern.go \
		./tests/nocopy.go \
		./tests/escaping.go
	bin/tinyjson -all \
		./tests/data.go \
 		./tests/nothing.go \
 		./tests/errors.go \
 		./tests/html.go \
 		./tests/type_declaration_skip.go
	bin/tinyjson \
		./tests/nested_easy.go \
		./tests/named_type.go \
		./tests/custom_map_key_type.go \
		./tests/embedded_type.go \
		./tests/reference_to_pointer.go \
		./tests/key_marshaler_map.go \
		./tests/unknown_fields.go \
		./tests/type_declaration.go \
		./tests/members_escaped.go \
		./tests/intern.go \
		./tests/nocopy.go \
		./tests/escaping.go \
		./tests/nested_marshaler.go
	bin/tinyjson -snake_case ./tests/snake.go
	bin/tinyjson -omit_empty ./tests/omitempty.go
	bin/tinyjson -build_tags=use_tinyjson -disable_members_unescape ./benchmark/data.go
	bin/tinyjson -disallow_unknown_fields ./tests/disallow_unknown.go
	bin/tinyjson -disable_members_unescape ./tests/members_unescaped.go

test: generate
	go test \
		./tests \
		./jlexer \
		./gen \
		./buffer
	golint -set_exit_status ./tests/*_tinyjson.go
	# TODO: fix benchmarks to not need float
	# cd benchmark && go test -benchmem -tags use_tinyjson -bench .

tiny-generate: build
	bin/tinyjson -all -snake_case \
		./tiny-tests/cosmwasm.go

tiny-test: tiny-generate
	# look into nounsafe later, this uses reflect, so I remove it just in case
	go test -v -tags tinyjson_nounsafe ./tiny-tests
	@ golint -set_exit_status ./tiny-tests/*_tinyjson.go
	@ echo "No files should be listed below:"
	@ grep -l encoding/json ./tiny-tests/*.go || true

tiny-bench:
	cd tiny-tests && go test -benchmem -bench .

bench-other: generate
	cd benchmark && make

bench-python:
	benchmark/ujson.sh


.PHONY: clean generate test build
