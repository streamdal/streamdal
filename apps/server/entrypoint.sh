#!/bin/bash

# Generate a unique identifier, e.g., using the hostname
NODE_NAME="node-$(hostname)"

# Set the environment variable
export STREAMDAL_SERVER_NODE_NAME=$NODE_NAME

# Execute the original Docker entry point
exec /streamdal-server --debug
