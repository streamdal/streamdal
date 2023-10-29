#!/usr/bin/env bash
#
# This script is used to install Streamdal.
#
# This script is also used for installing Streamdal via curl:
#
# curl -s https://install.streamdal.com | bash
#
# This script requires that you have `git`, `docker` and `docker-compose` installed.
#
# If the script detects a previous installation, it will error out. You can
# override this behavior by setting `STREAMDAL_INSTALL_FORCE=true` env var and
# re-running the install.
#
# By default, the script will `git clone` the streamdal repo to ~/streamdal.
# You can change the directory streamdal will be installed in by setting the
# `STREAMDAL_INSTALL_DIR` env var to another directory.
#

INSTALL_DIR=~/streamdal
INSTALL_DIR_DOCKER="$INSTALL_DIR/install/docker"
STREAMDAL_REPO="git@github.com:streamdal/streamdal.git"

fatal() {
  printf "\x1b[48;5;%sm» ⚠️  ${1}\e[0m\n" "196"
  exit 1
}

info() {
  printf "\x1b[48;5;%sm» ${1}\e[0m\n" "99"
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
fi

if [[ -d $INSTALL_DIR ]]; then
  if [[ ! -n $STREAMDAL_INSTALL_FORCE ]]; then
    fatal "Streamdal is already installed in ${INSTALL_DIR}. Set STREAMDAL_INSTALL_FORCE=true to override."
  fi

  info "Streamdal is already installed in ${INSTALL_DIR} - forcing install..."

  # Force is set - rename dir to
  RENAME_DIR="${INSTALL_DIR}.backup.$(date +%s || fatal 'Failed to rename ${INSTALL_DIR}')"

  mv -f "$INSTALL_DIR" "$RENAME_DIR" || fatal "Unable to rename ${INSTALL_DIR} to ${RENAME_DIR}"

  info "Successfully renamed ${INSTALL_DIR} to ${RENAME_DIR}"
fi

info "Cloning repo '${STREAMDAL_REPO}' to '${INSTALL_DIR}'..."

# Clone streamdal repo
git clone $STREAMDAL_REPO "$INSTALL_DIR" > /dev/null || fatal "Failed to clone ${STREAMDAL_REPO} to ${INSTALL_DIR}"

# Change to install dir
cd "$INSTALL_DIR_DOCKER" || fatal "Failed to change to install dir ${INSTALL_DIR_DOCKER}"

info "Starting streamdal components via docker-compose..."

# Attempt to start streamdal components
docker-compose up -d --pull --always-recreate-deps --force-recreate --quiet-pull || fatal "Failed to start streamdal"

info "🎉 Streamdal has been successfully installed! 🎉"
info "You can access the UI at http://localhost:8081"
