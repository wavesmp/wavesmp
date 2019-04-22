#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

REPO_DIR="$(readlink -f "$(dirname "${0}")")"
cd "${REPO_DIR}"
TOP_DIR="$(readlink -f "${REPO_DIR}/../..")"

BUILD_DIR=$(readlink -f build)

CONTAINER_NAME="$(basename "${REPO_DIR}")"

remove_container() {
    if [[ ! -z "$(docker ps --all --quiet --filter name="${CONTAINER_NAME}")" ]]; then
    	docker stop "${CONTAINER_NAME}"
    	docker rm "${CONTAINER_NAME}"
    fi
}

usage() {
    echo "Usage: $0 <host>"
    echo "  host - server host name"
    exit 1
}

copy_static_assets() {
    cp src/index.html \
       src/favicon.ico \
       vendor/aws-sdk-2.268.1.min.js \
       "${BUILD_DIR}"
}
