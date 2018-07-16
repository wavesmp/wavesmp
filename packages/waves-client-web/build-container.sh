#!/bin/bash

set -o errexit
set -o pipefail

usage() {
    echo "Usage: $0 <host>"
    echo "  host - server host name"
    exit 1
}

HOST="$1"

if [[ -z "${HOST}" ]]; then
    usage
fi

cd "$(dirname "${0}")"

BUILD_DIR=build

# Clean
sudo rm -rf "${BUILD_DIR}"

# Build
./npm.sh run build

sudo chown -R osoriano:osoriano build

# Copy static assets
cp src/index.html \
   src/favicon.ico \
   vendor/aws-sdk-2.268.1.min.js \
   "${BUILD_DIR}"

# Build Docker images
sudo docker build -t waves-client-web --build-arg "host=${HOST}" .
