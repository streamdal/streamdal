#!/bin/bash
#
# Download the latest WASM artifacts from Github
#

# Step 1: Curl the GitHub API to get the latest release
latest_release=$(curl -s https://api.github.com/repos/streamdal/snitch-wasm/releases/latest)

# Step 2: Extract the "browser_download_url" from the JSON response
download_url=$(echo "$latest_release" | grep -o 'https://.*\.zip')

# Step 3: Add debug info
version=$(echo $download_url | cut -d / -f8)
echo "WASM artifact version: ${version}"

# Step 4: Curl the download URL and save as release.zip
curl -L "$download_url" -o release.zip

# Step 5: Backup original wasm files
mkdir -p old
mv -f *.wasm old/

# Step 6: Unzip release.zip and rename wasm files to include release version
unzip -o release.zip -d .

# Step 7: Rename wasm files to include release version
version_filename=$(echo $version | sed 's/v//g' | sed 's/-/_/g' | sed 's/\./_/g')

echo "Version filename: ${version_filename}"

for i in `ls *.wasm`; do
  mv $i ${i%.wasm}_${version_filename}.wasm
done

# Step 6: Clean up
rm release.zip
