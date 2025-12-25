#!/bin/bash
set -e

REPO="sacada-labs/setup-my-mac"
BINARY="setup"

# Use latest tag
TAG="latest"

# Download binary to temporary file in /tmp
TEMP_BINARY=$(mktemp /tmp/${BINARY}.XXXXXX)
curl -#L "https://github.com/${REPO}/releases/download/${TAG}/${BINARY}" -o "${TEMP_BINARY}"

# Make executable
chmod +x "${TEMP_BINARY}"

# Move to final location
mv "${TEMP_BINARY}" "${BINARY}"

# Execute the binary
./${BINARY}
