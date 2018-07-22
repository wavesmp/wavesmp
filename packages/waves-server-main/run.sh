#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

REPO_DIR="$(readlink -f "$(dirname "$0")")"
cd "${REPO_DIR}"

DEST_REPO_DIR="/home/node/$(basename "${REPO_DIR}")"

PACKAGES_DIR="$(readlink -f "${REPO_DIR}/..")"
DEST_PACKAGES_DIR=/home/node

CONTAINER_NAME="$(basename "${REPO_DIR}")"
IMAGE=node:10.7.0
PORT=16242


if [[ ! -z "$(docker ps -a -q -f name="${CONTAINER_NAME}")" ]]; then
	docker stop "${CONTAINER_NAME}"
	docker rm "${CONTAINER_NAME}"
fi

docker run \
    -d \
    -p "${PORT}:${PORT}" \
    -v "${PACKAGES_DIR}:${DEST_PACKAGES_DIR}:rw" \
    -w "${DEST_REPO_DIR}" \
    --net host \
    --name "${CONTAINER_NAME}" \
    "${IMAGE}" \
    bash -c "\
    npm run start"


docker logs -f "${CONTAINER_NAME}"
