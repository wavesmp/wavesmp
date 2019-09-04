#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

cd "$(dirname "$0")"

IMAGE=python:3.7.4-slim-stretch
BUCKET_NAME="$1"


docker run \
    --rm \
    --interactive \
    --tty \
    --volume "$(pwd):/repo" \
    --volume ~/.aws:/root/.aws \
    --net host \
    "${IMAGE}" \
    bash -c "\
    set -o errexit
    set -o pipefail
    set -o nounset

    cd /repo
    pip install --upgrade pip
    pip install --upgrade pipenv
    pipenv install --dev
    pipenv run python check.py ${BUCKET_NAME}
    "
