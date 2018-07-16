#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

NAME=waves-client-web-build
PACKAGES_DIR="$(readlink -f "$(pwd)/..")"
REPO_NAME=waves-client-web
IMAGE=node:9.11.1

docker run \
    --rm \
    --net host \
    --name "${NAME}" \
    -v "${PACKAGES_DIR}:/home/node:rw" \
    -w "/home/node/${REPO_NAME}" \
    "${IMAGE}" \
    bash -c "\
    npm $*"
