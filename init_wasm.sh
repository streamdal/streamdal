#!/bin/bash

# Step 1: Curl the GitHub API to get the latest release
latest_release=$(curl -s https://api.github.com/repos/streamdal/streamdal/releases/latest)

# Step 2: Extract the "browser_download_url" from the JSON response
download_url=$(echo "$latest_release" | grep -o 'https://.*\.zip')

# Step 3: Add debug info
mkdir -p assets/test
version=$(echo $download_url | cut -d / -f10)
echo "WASM artifact version: ${version}" > assets/test/version.txt
echo "Last updated: $(date)" >> assets/test/version.txt

# Step 4: Curl the download URL and save as release.zip
curl -L "$download_url" -o release.zip

# Step 5: Unzip release.zip into the assets/test/ directory
unzip -o release.zip -d assets/test/

# Step 6: Clean up & info
rm release.zip
cat assets/test/version.txt
