#!/usr/bin/env bash
#
# This script will attempt to get the version of the running server and display
# how many tags it's behind the latest REMOTE tag.
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
git fetch --tags $GIT_ORIGIN || fatal "Failed to fetch tags from ${GIT_ORIGIN}"

# Get the latest tag from the remote
LATEST_TAG=$(git describe --tags `git rev-list --tags --max-count=1`) || fatal "Failed to get latest tag"

# Get the version of the server
SERVER_VERSION=$(curl -s $SERVER_VERSION_URL | cut -d \- -f1)

if [[ -z $SERVER_VERSION ]]; then
  fatal "Failed to get server version from ${SERVER_VERSION_URL}. Is the server running?"
fi

echo "SERVER_VERSION: ${SERVER_VERSION}"
echo "LATEST_TAG: ${LATEST_TAG}"

# Check if the server version matches the latest tag
if [[ "${SERVER_VERSION}" == "${LATEST_TAG}" ]]; then
  echo "Server is up to date with the latest tag."
else
  echo "Server is not up to date. Latest tag is ${LATEST_TAG}."
  # If you want to count the number of tags behind, you'll need to list them and compare
  TAGS=($(git tag))
  SERVER_VERSION_INDEX=-1
  LATEST_TAG_INDEX=-1
  for i in "${!TAGS[@]}"; do
    if [[ "${TAGS[$i]}" == "${SERVER_VERSION}" ]]; then
      SERVER_VERSION_INDEX=$i
    fi
    if [[ "${TAGS[$i]}" == "${LATEST_TAG}" ]]; then
      LATEST_TAG_INDEX=$i
    fi
  done

  if [[ $SERVER_VERSION_INDEX -ne -1 && $LATEST_TAG_INDEX -ne -1 ]]; then
    TAGS_BEHIND=$((LATEST_TAG_INDEX - SERVER_VERSION_INDEX))
    echo "Server is ${TAGS_BEHIND} tag(s) behind the latest."
  else
    fatal "Failed to determine the number of tags behind the latest."
  fi
fi

exit 0
