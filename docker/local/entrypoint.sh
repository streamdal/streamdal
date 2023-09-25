#!/bin/bash

# Load environment variables from .env file
source /path/to/.env

# Check if the secret is already set
if [[ -z "${SNITCH_SERVER_AES_KEY}" ]]; then
  # Generate a secret and write it to the .env file
  echo "SNITCH_SERVER_AES_KEY=$(head /dev/urandom | aws '{print $1}' | head -c 65 | sha256sum )" >> .env
  source .env
fi

# Execute the CMD from the Dockerfile
exec "$@"
