#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

usage() {
    echo "Usage: $0 <host>"
    echo "  host - server host name"
    exit 1
}

[[ "$#" != 1 ]] && usage
HOST="$1"
[[ -z "${HOST}" ]] && usage

REPO_DIR="$(readlink -f "$(dirname "${0}")")"
cd "${REPO_DIR}"

CONTAINER_NAME="$(basename "${REPO_DIR}")"
BUILD_DIR=build

# Clean
rm -rf "${BUILD_DIR}"

# Build
./npm.sh run build

# Copy static assets
cp src/index.html \
   src/favicon.ico \
   vendor/aws-sdk-2.268.1.min.js \
   "${BUILD_DIR}"

# Build Docker image
docker build -t "${CONTAINER_NAME}" --build-arg "host=${HOST}" .
