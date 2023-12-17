#!/usr/bin/env bash
#
# This script is used for installing Streamdal.
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

INSTALL_DIR=~/streamdal
INSTALL_DIR_DOCKER="$INSTALL_DIR/install/docker"
STREAMDAL_REPO="https://github.com/streamdal/streamdal.git"
DEFAULT_UI_URL="http://localhost:8080"

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
}

info "Checking requirements..."

# Check if requirements are met
check_requirements

# Check install dir
if [[ -n $STREAMDAL_INSTALL_DIR ]]; then
  INSTALL_DIR=$STREAMDAL_INSTALL_DIR
  INSTALL_DIR_DOCKER="$INSTALL_DIR/install/docker"
fi

if [[ -d $INSTALL_DIR ]]; then
  warning "Detected previous installation in ${INSTALL_DIR}"

  RENAME_DIR="${INSTALL_DIR}.backup.$(date +%s || fatal 'Failed to rename ${INSTALL_DIR}')"

  mv -f "$INSTALL_DIR" "$RENAME_DIR" || fatal "Unable to rename ${INSTALL_DIR} to ${RENAME_DIR}"

  warning "Successfully backed up ${INSTALL_DIR} to ${RENAME_DIR}" 
fi

info "Cloning repo '${STREAMDAL_REPO}' to '${INSTALL_DIR}'..."

# Clone streamdal repo
git clone $STREAMDAL_REPO "$INSTALL_DIR" > /dev/null || fatal "Failed to clone ${STREAMDAL_REPO} to ${INSTALL_DIR}"

# Change to install dir
cd "$INSTALL_DIR_DOCKER" || fatal "Failed to change to install dir ${INSTALL_DIR_DOCKER}"

info "Starting streamdal components via docker-compose..."

# Attempt to start streamdal components
docker-compose up -d --pull always --always-recreate-deps --force-recreate --quiet-pull || fatal "Failed to start streamdal"

info "🎉 Streamdal has been successfully installed! 🎉"
info "You can access the UI at ${DEFAULT_UI_URL}"
