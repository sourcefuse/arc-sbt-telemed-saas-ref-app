#!/bin/bash -e

if [ ! -f "cdk.json" ]; then
    echo "Error: Please run this script from project root."
    exit 1
fi

PROJECT_ROOT=$PWD

# Load variables from .env file
eval "$(
  cat .env | awk '!/^\s*#/' | awk '!/^\s*$/' | while IFS='' read -r line; do
    key=$(echo "$line" | cut -d '=' -f 1)
    value=$(echo "$line" | cut -d '=' -f 2-)
    echo "export $key=\"$value\""
  done
)"

# TODO: Write cleanup script