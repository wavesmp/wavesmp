#!/bin/bash
#
# Runs an npm command in a container
#

set -o errexit
set -o nounset
set -o pipefail

REPO_DIR="$(readlink -f "$(dirname "${0}")")"
cd "${REPO_DIR}"

DEST_REPO_DIR="/home/node/$(basename "${REPO_DIR}")"

PACKAGES_DIR="$(readlink -f "${REPO_DIR}/..")"
DEST_PACKAGES_DIR=/home/node

CONTAINER_NAME="$(basename "${REPO_DIR}")-build"
IMAGE=node:10.7.0

docker run \
    --rm \
    -u "${UID}" \
    --name "${CONTAINER_NAME}" \
    -v "${PACKAGES_DIR}:${DEST_PACKAGES_DIR}:rw" \
    -w "${DEST_REPO_DIR}" \
    "${IMAGE}" \
    bash -c "\
    npm $*"
