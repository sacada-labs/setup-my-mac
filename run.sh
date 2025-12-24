#!/bin/bash
set -e

REPO="sacada-labs/setup-my-mac"
BINARY="setup"

# Get latest release tag
echo "Fetching latest release..."
TAG=$(curl -sL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"tag_name": "([^"]+)".*/\1/')

# Download binary to temporary file in /tmp
echo "Downloading ${BINARY}..."
TEMP_BINARY=$(mktemp /tmp/${BINARY}.XXXXXX)
curl -sL "https://github.com/${REPO}/releases/download/${TAG}/${BINARY}" -o "${TEMP_BINARY}"

# Make executable
chmod +x "${TEMP_BINARY}"

# Move to final location
mv "${TEMP_BINARY}" "${BINARY}"

echo "Downloaded ${BINARY}"

# Execute the binary
./${BINARY}
