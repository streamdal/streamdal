#!/bin/bashecho
#
# Download a specific version of the wasm release.
#

function fatal() {
    echo "ERROR: $1"
    exit 1
}

trap "rm -f release.zip" EXIT

# If version file does not exist, exit
if [ ! -f "version" ]; then
  echo "ERROR: version file does not exist"
  exit 1
fi

# Get the version from the version file
version=$(cat version)
download_url="https://github.com/streamdal/streamdal/releases/download/libs%2Fwasm%2F${version}/release.zip"

# Remove previous release.zip (if exists)
rm -f release.zip

# Download the specified release
curl -L "${download_url}" -o release.zip || fatal "Failed to fetch release version ${version}"

# Verify we got the release
if [ ! -f "release.zip" ]; then
  echo "ERROR: release.zip does not exist (after download)"
  exit 1
fi

# Remove any existing Wasm files
rm -rf *.wasm

# Unzip release.zip and rename wasm files to include release version
unzip -o release.zip -d . || fatal "Failed to unzip release.zip"

# Clean up
rm release.zip
