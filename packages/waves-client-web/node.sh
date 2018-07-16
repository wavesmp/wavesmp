#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

NAME=waves-client-web-node
IMAGE=node:9.11.1

docker run \
    -it \
    --rm \
    --net host \
    --name "${NAME}" \
    -v "$(pwd)/..:/home/node:rw" \
    -w "/home/node/${NAME}" \
    "${IMAGE}" node
