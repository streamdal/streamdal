#!/bin/bash
#
# This install script will attempt to download the latest Streamdal CLI binary
# and install it as /usr/local/bin/streamdal-cli.
#

if [[ $1 == "-f" ]]; then
  echo "Forcing install..."
else
  if [ -f "/usr/local/bin/streamdal-cli" ]; then
    echo "Streamdal CLI is already installed. To overwrite, pass -f flag or check https://docs.streamdal.com/cli/upgrade for manual upgrade instructions."
    exit 1
  fi
fi

GITHUB_LATEST_API_URL="https://api.github.com/repos/streamdal/cli/releases/latest"
GITHUB_DOWNLOAD_URL="https://github.com/streamdal/cli/releases/download"
CANNOT_INSTALL_ERR="Cannot install via install script - check https://docs.streamdal.com/cli/install for manual installation instructions"

OS=$(uname -s)
ARCH=$(uname -m)
LATEST_VERSION=$(curl -s $GITHUB_LATEST_API_URL | grep -o '"tag_name": ".*"' | sed 's/"//g' | sed 's/tag_name: //g')

if [ "$OS" == "Linux" ]; then
  if [ "$ARCH" == "x86_64" ]; then
    FULL_URL="${GITHUB_DOWNLOAD_URL}/${LATEST_VERSION}/streamdal-linux"
  else
    echo $CANNOT_INSTALL_ERR
    exit 1
  fi
elif [ "$OS" == "Darwin" ]; then
  if [ "${ARCH}" == "x86_64" ]; then
    FULL_URL="${GITHUB_DOWNLOAD_URL}/${LATEST_VERSION}/streamdal-darwin"
  elif [ "${ARCH}" == "arm64" ]; then
    FULL_URL="${GITHUB_DOWNLOAD_URL}/${LATEST_VERSION}/streamdal-darwin-arm64"
  else
    echo $CANNOT_INSTALL_ERR
    exit 1
  fi
else
  echo $CANNOT_INSTALL_ERR
  exit 1
fi

INSTALL_DIR="/usr/local/bin"
BIN_NAME="streamdal-cli"

# Download and install the Go binary
curl -L -o "${INSTALL_DIR}/${BIN_NAME}" "${FULL_URL}"
chmod +x "${INSTALL_DIR}/${BIN_NAME}"

# Check if the installation was successful
if [ $? -eq 0 ]; then
  echo "Streamdal CLI ${LATEST_VERSION} (${OS}/${ARCH}) installed successfully to ${INSTALL_DIR}/${BIN_NAME}"
else
  echo "Installation failed. Submit an issue at https://github.com/streamdal/cli/issues/new"
fi
