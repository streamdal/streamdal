#!/bin/bash

# Step 1: Curl the GitHub API to get the latest release
latest_release=$(curl -s https://api.github.com/repos/streamdal/dataqual-wasm/releases/latest)

# Step 2: Extract the "browser_download_url" from the JSON response
download_url=$(echo "$latest_release" | grep -o 'https://.*\.zip')

# Step 3: Curl the download URL and save as release.zip
curl -L "$download_url" -o release.zip

# Step 4: Unzip release.zip into the src/ directory
unzip -o release.zip -d src/

# Clean up: Remove the downloaded zip file
rm release.zip

