#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

REPO_DIR="$(readlink -f "$(dirname "${0}")")"
cd "${REPO_DIR}"

CONTAINER_NAME="$(basename "${REPO_DIR}")"

# Usually, the container only needs read access to the files below.
# However, since it's convenient to renew the the certs within
# the container (for now), pass the entire letsencrypt conf
#   CERT=/etc/letsencrypt/live/__HOST__/fullchain.pem
#   KEY=/etc/letsencrypt/live/__HOST__/privkey.pem

LETSENCRYPT_SRC="$(readlink -f rootfs/etc/letsencrypt)"
LETSENCRYPT_DEST=/etc/letsencrypt
DHPARAM_SRC="$(readlink -f rootfs/etc/ssl/certs/dhparam.pem)"
DHPARAM_DEST=/etc/ssl/certs/dhparam.pem

if [[ ! -z "$(docker ps -a -q -f name="${CONTAINER_NAME}")" ]]; then
	docker stop "${CONTAINER_NAME}"
	docker rm "${CONTAINER_NAME}"
fi

docker run \
    -d \
    -p 80:80 \
    -p 443:443 \
    -v "${LETSENCRYPT_SRC}:${LETSENCRYPT_DEST}" \
    -v "${DHPARAM_SRC}:${DHPARAM_DEST}:ro" \
    --net host \
    --name "${CONTAINER_NAME}" \
    "${CONTAINER_NAME}"
