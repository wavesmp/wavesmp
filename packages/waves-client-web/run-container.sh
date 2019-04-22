#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

source build-common.sh




# Usually, the container only needs read access to the files below.
# However, since it's convenient to renew the the certs within
# the container (for now), pass the entire letsencrypt conf
#   CERT=/etc/letsencrypt/live/__HOST__/fullchain.pem
#   KEY=/etc/letsencrypt/live/__HOST__/privkey.pem

LETSENCRYPT_SRC="$(readlink -f rootfs/etc/letsencrypt)"
LETSENCRYPT_DEST=/etc/letsencrypt
DHPARAM_SRC="$(readlink -f rootfs/etc/ssl/certs/dhparam.pem)"
DHPARAM_DEST=/etc/ssl/certs/dhparam.pem

remove_container

docker run \
    --detach \
    --publish 80:80 \
    --publish 443:443 \
    -v "${LETSENCRYPT_SRC}:${LETSENCRYPT_DEST}" \
    -v "${DHPARAM_SRC}:${DHPARAM_DEST}:ro" \
    --network host \
    --name "${CONTAINER_NAME}" \
    "${CONTAINER_NAME}"
