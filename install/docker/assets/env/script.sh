#!/bin/sh

# Path to .env file
ENV_PATH="/assets/env/.env"

# Load environment variables from .env file
if [ -f $ENV_PATH ]; then
    source $ENV_PATH
fi

# Check if the secret is already set
if [ -z "${STREAMDAL_SERVER_AES_KEY}" ]; then
  # Generate a secret and write it to the .env file
  echo "SNITCH_SERVER_AES_KEY=$(head /dev/urandom | head -c 65 | sha256sum | awk '{print $1}' )" >> $ENV_PATH
fi
