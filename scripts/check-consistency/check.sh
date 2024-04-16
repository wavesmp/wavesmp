#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

cd "$(dirname "$0")"

IMAGE=python:3.7.4-slim-stretch


if [[ "$#" != 1 ]]; then
  echo "Usage: $0 <track-bucket-name>"
  exit 1
fi

BUCKET_NAME="$1"

docker run \
    --rm \
    --interactive \
    --tty \
    --volume "$(pwd):/repo" \
    --volume ~/.aws:/root/.aws \
    --net wavesmp_wavesmp \
    "${IMAGE}" \
    bash -c "\
    set -o errexit
    set -o pipefail
    set -o nounset

    cd /repo
    pip install --upgrade pip
    pip install --upgrade pipenv
    pipenv install --dev
    pipenv run black --target-version py37 -S *.py
    pipenv run python check.py ${BUCKET_NAME} || bash
    "
