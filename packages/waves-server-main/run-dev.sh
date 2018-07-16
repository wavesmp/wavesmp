#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

cd "$(dirname "$0")"

NAME=waves-server-main
IMAGE=node:9.9
PORT=16242
PACKAGES_DIR="$(readlink -f "$(pwd)/..")"

docker run \
    --rm \
    -p "${PORT}:${PORT}" \
    -v "${PACKAGES_DIR}:/home/node:rw" \
    -w "/home/node/${NAME}" \
    --net host \
    --name "${NAME}" \
    "${IMAGE}" \
    bash -c "\
    npm run start"
