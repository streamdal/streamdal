# Pattern #1 example: "example : description = Description for example target"
# Pattern #2 example: "### Example separator text
help: HELP_SCRIPT = \
	if (/^([a-zA-Z0-9-\.\/]+).*?: description\s*=\s*(.+)/) { \
		printf "\033[34m%-40s\033[0m %s\n", $$1, $$2 \
	} elsif(/^\#\#\#\s*(.+)/) { \
		printf "\033[33m>> %s\033[0m\n", $$1 \
	}

.PHONY: help
help:
	@perl -ne '$(HELP_SCRIPT)' $(MAKEFILE_LIST)

.PHONY: test/benchmarks
test/benchmarks: description = Generate benchmarks.txt file
test/benchmarks:
	@echo "# Benchmark Results\n\n\`\`\`" > BENCHMARKS.md
	cargo bench | grep -v ignore >> benchmarks.md
	@echo "\`\`\`" >> benchmarks.md
