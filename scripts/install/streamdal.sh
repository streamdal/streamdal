#!/usr/bin/env bash
#
# This script is used for installing Streamdal.
#
# Usage #1: curl -sSL https://raw.githubusercontent.com/streamdal/streamdal/master/scripts/install/install.sh | bash
#
# This script will:
#
# - Check that you have `git`, `docker` and `docker-compose` installed
# - Look for previous install; if found, move it to a backup dir
# - Clone the streamdal repo to $STREAMDAL_INSTALL_DIR (default: ~/streamdal)
# - Start streamdal components via docker-compose
#
# Set $STREAMDAL_INSTALL_DIR to change the install dir.
#
# github.com/streamdal/streamdal
#

REPO_URL="https://github.com/streamdal/streamdal"
DOCS_URL="https://docs.streamdal.com"
DEFAULT_UI_URL="http://localhost:8080"
INSTALL_DIR="/tmp/.streamdal"
INSTALL_SUB_DIRS="assets/envoy assets/env"
ENVOY_URL="https://raw.githubusercontent.com/streamdal/streamdal/main/docs/install/docker/assets/envoy/envoy.yaml"
DOCKER_COMPOSE_URL="https://raw.githubusercontent.com/streamdal/streamdal/main/docs/install/docker/docker-compose.yml"
DOT_ENV_URL="https://raw.githubusercontent.com/streamdal/streamdal/main/docs/install/docker/assets/env/.env"
ENV_SCRIPT_URL="""https://raw.githubusercontent.com/streamdal/streamdal/main/docs/install/docker/assets/env/script.sh"
DOCKER_COMPOSE_YML_FILE="${INSTALL_DIR}/docker-compose.yml"

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

fetch() {
    # Remove previous install dir
    rm -rf $INSTALL_DIR

    # Setup dirs
    for dir in $INSTALL_SUB_DIRS; do
        mkdir -p $INSTALL_DIR/$dir
    done

    # Fetch files
    # curl -sSL $DOCKER_COMPOSE_URL -o $INSTALL_DIR/docker-compose.yml || fatal "Failed to fetch docker-compose.yml"
    curl -sSL $ENV_SCRIPT_URL -o $INSTALL_DIR/assets/env/script.sh || fatal "Failed to fetch assets/env/script.sh"
    curl -sSL $DOT_ENV_URL -o $INSTALL_DIR/assets/env/.env || fatal "Failed to fetch assets/env/.env"
    curl -sSL $ENVOY_URL -o $INSTALL_DIR/assets/envoy/envoy.yaml || fatal "Failed to fetch assets/envoy/envoy.yaml"

    # Verify files
    for f in docker-compose.yml assets/env/script.sh assets/env/.env assets/envoy/envoy.yaml; do
        if [ ! -f "${INSTALL_DIR}/${f}" ]; then
            fatal "File ${INSTALL_DIR}/${f} does not exist after fetch"
        fi

        # Check that file doesn't have zero-length
        if [ "$(wc -l < "${INSTALL_DIR}/${f}")" -lt 1 ]; then
          fatal "Unexpected content length in ${INSTALL_DIR}/${f}"
        fi
    done
}

check_requirements() {
  if ! command -v git > /dev/null; then
    fatal "git is not installed - install it and run installer again"
  fi

  if ! command -v docker > /dev/null; then
    fatal "docker is not installed - install it and run installer again"
  fi

  if ! command -v docker-compose > /dev/null; then
    fatal "docker-compose is not installed - install it and run installer again"
  fi

  # Does /tmp exist?
  if [ ! -d /tmp ]; then
    fatal "/tmp does not exist"
  fi

  # Is /tmp writable?
  if [ ! -w /tmp ]; then
    fatal "/tmp is not writable"
  fi
}

info "Checking requirements..."

# Check if requirements are met
check_requirements

info "Fetching install files..."

# Fetch docker-compose.yml and write it to /tmp
fetch

# Work from install dir
cd $INSTALL_DIR

# Grab versions
CONSOLE_VERSION=$(grep 'image:' $DOCKER_COMPOSE_YML_FILE | grep 'console' | awk -F : {'print $3'})
SERVER_VERSION=$(grep 'image:' $DOCKER_COMPOSE_YML_FILE | grep 'server' | awk -F : {'print $3'})

# Check if variables are set
if [ -z "$CONSOLE_VERSION" ]; then
  fatal "Unable to determine Streamdal console version"
fi

if [ -z "$SERVER_VERSION" ]; then
  fatal "Unable to determine Streamdal server version"
fi

info "Starting streamdal components via docker-compose..."

# Attempt to start streamdal components
docker-compose -f $DOCKER_COMPOSE_YML_FILE up -d --pull always --always-recreate-deps --force-recreate --quiet-pull || fatal "Failed to start streamdal"
echo ""
info "🎉 Streamdal has been successfully started! 🎉"
info ""
info "Server version: ${SERVER_VERSION}"
info "Console (UI) version: ${CONSOLE_VERSION}"
info ""
info "Github Repository: ${REPO_URL}"
info "Documentation: ${DOCS_URL}"
info ""
info "You can access the UI at ${DEFAULT_UI_URL}"
