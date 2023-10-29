#!/usr/bin/env bash
#
# This script will attempt to get the version of the running server and display
# how many commits it's behind the latest REMOTE commit.
#

GIT_ORIGIN="sd_origin"
GIT_REMOTE="git@github.com:streamdal/server.git"
SERVER_VERSION_URL="http://localhost:8081/version"

fatal() {
  echo "FATAL: $1"
  exit 1
}

# Setup origin if it doesn't exist
if ! git remote -v | grep -E "${GIT_ORIGIN}.*${GIT_REMOTE}.*fetch" > /dev/null; then
  echo "'${GIT_ORIGIN}' remote does not exist - adding..."
  git remote add $GIT_ORIGIN $GIT_REMOTE || fatal "Failed to add remote ${GIT_ORIGIN} ${GIT_REMOTE}"
fi

# Update origin
git fetch $GIT_ORIGIN || fatal "Failed to fetch ${GIT_ORIGIN}"

# Get the latest version of the server
SERVER_VERSION=$(curl -s $SERVER_VERSION_URL | cut -b 30-36)

if [[ -z $SERVER_VERSION ]]; then
  fatal "Failed to get server version from ${SERVER_VERSION_URL}. Is the server running?"
fi

GIT_COMMITS=$(git rev-list $GIT_ORIGIN/main)

# Save old split settings
export OLD_IFS=$IFS
export IFS=$'\n'

ITER=0

# Display how many commits current version is behind remote
for line in $GIT_COMMITS; do
  if [[ "${line}" == *"${SERVER_VERSION}"* ]]; then
    echo "SERVER_VERSION: ${SERVER_VERSION}"
    echo "COMMITS_BEHIND: ${ITER}"

    FOUND_COMMIT=true

    break
  fi

  ITER=$((ITER+1))
done

if [[ -z $FOUND_COMMIT ]]; then
  fatal "Failed to find commit for version ${SERVER_VERSION}"
fi

exit 0
