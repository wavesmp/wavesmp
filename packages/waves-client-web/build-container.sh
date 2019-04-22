#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

source build-common.sh

[[ "$#" != 1 ]] && usage
HOST="$1"
[[ -z "${HOST}" ]] && usage

# Clean
rm -rf "${BUILD_DIR}"

# Build
cd "${TOP_DIR}"
npm run build
cd "${REPO_DIR}"

copy_static_assets

# Build Docker image
docker build --tag "${CONTAINER_NAME}" --build-arg "host=${HOST}" .
