#!/bin/bash

# Check if an argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <new_version>"
  exit 1
fi

# Assign the new version from the argument
new_version="$1"

# Find all Cargo.toml files and update the version
find . -name 'Cargo.toml' -exec sed -i.bak "s/streamdal-protos = \"[^\"]*\"/streamdal-protos = \"$new_version\"/g" {} +

# Find all Cargo.toml.bak files and remove them
find . -name 'Cargo.toml.bak' -exec rm {} +

# Change into specific directories
cd common || exit
cargo update

cd ../detective || exit
cargo update

cd ../httprequest || exit
cargo update

cd ../inferschema || exit
cargo update

cd ../kv || exit
cargo update

cd ../transform || exit
cargo update

cd ../validjson || exit
cargo update
