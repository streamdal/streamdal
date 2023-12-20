#!/usr/bin/env bash
#
# This install script will attempt to download the latest Streamdal CLI binary
# and install it as /usr/local/bin/streamdal-cli.
#
# github.com/streamdal/cli
#

STREAMDAL_CLI_BIN="streamdal-cli"
STREAMDAL_CLI_BIN_FULL="/usr/local/bin/${STREAMDAL_CLI_BIN}"
GITHUB_LATEST_API_URL="https://api.github.com/repos/streamdal/cli/releases/latest"
GITHUB_DOWNLOAD_URL="https://github.com/streamdal/cli/releases/download"
CANNOT_INSTALL_ERR="Cannot install via install script - check https://docs.streamdal.com/cli/install for manual installation instructions"

fatal() {
  printf "\x1b[48;5;%sm» ⚠️  ${1}\e[0m\n" "196"
  exit 1
}

info() {
  printf "\x1b[48;5;%sm» ${1}\e[0m\n" "99"
}

warning() {
  printf "\x1b[48;5;%sm»️ ${1}\e[0m\n" "214"
}

if [ -f "${STREAMDAL_CLI_BIN_FULL}" ]; then
  warning "Detected previous installation of ${STREAMDAL_CLI_BIN_FULL}"

  if [[ $1 != "force" ]]; then
    fatal "Streamdal CLI is already installed. To overwrite, pass 'force' arg: curl -sSL https://sh.streamdal.com/cli | sh -s force"
  fi

  warning "Overwriting previous installation at ${STREAMDAL_CLI_BIN_FULL}"
fi

OS=$(uname -s)
ARCH=$(uname -m)
LATEST_VERSION=$(curl -s $GITHUB_LATEST_API_URL | grep -o '"tag_name": ".*"' | sed 's/"//g' | sed 's/tag_name: //g')

if [ "$OS" == "Linux" ]; then
  if [ "$ARCH" == "x86_64" ]; then
    FULL_URL="${GITHUB_DOWNLOAD_URL}/${LATEST_VERSION}/streamdal-linux"
  else
    fatal "${CANNOT_INSTALL_ERR}"
  fi
elif [ "$OS" == "Darwin" ]; then
  if [ "${ARCH}" == "x86_64" ]; then
    FULL_URL="${GITHUB_DOWNLOAD_URL}/${LATEST_VERSION}/streamdal-darwin"
  elif [ "${ARCH}" == "arm64" ]; then
    FULL_URL="${GITHUB_DOWNLOAD_URL}/${LATEST_VERSION}/streamdal-darwin-arm64"
  else
    fatal "${CANNOT_INSTALL_ERR}"
  fi
else
  fatal "${CANNOT_INSTALL_ERR}"
fi

# Download and install the Go binary
curl -sSL -o "${STREAMDAL_CLI_BIN_FULL}" "${FULL_URL}"
chmod +x "${STREAMDAL_CLI_BIN_FULL}"

# Check if the installation was successful
if [ $? -eq 0 ]; then
  info "🎉Streamdal CLI ${LATEST_VERSION} (${OS}/${ARCH}) installed successfully to ${STREAMDAL_CLI_BIN_FULL} 🎉"
else
  fatal "Installation failed. Submit an issue at https://github.com/streamdal/cli/issues/new"
fi

