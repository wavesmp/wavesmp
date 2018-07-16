#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

cd "$(dirname "${0}")"

NAME=waves-server-main
PORT=16242

docker build -t "${NAME}" .

docker run \
    --rm \
    -p "${PORT}:${PORT}" \
    --net host \
    --name "${NAME}" \
    "${NAME}"
