#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

source build-common.sh

[[ "$#" != 1 ]] && usage
HOST="$1"
[[ -z "${HOST}" ]] && usage

remove_container

# Clean
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

# Start server
# Usually, the container only needs read access to the files below.
# However, since it's convenient to renew the the certs within
# the container (for now), pass the entire letsencrypt conf
#   CERT=/etc/letsencrypt/live/__HOST__/fullchain.pem
#   KEY=/etc/letsencrypt/live/__HOST__/privkey.pem

LETSENCRYPT_SRC="$(readlink -f rootfs/etc/letsencrypt)"
LETSENCRYPT_DEST=/etc/letsencrypt
DHPARAM_SRC="$(readlink -f rootfs/etc/ssl/certs/dhparam.pem)"
DHPARAM_DEST=/etc/ssl/certs/dhparam.pem

NGINX_CONF_SRC="$(readlink -f rootfs/etc/nginx/nginx.conf)"
NGINX_CONF_DST=/etc/nginx/nginx.conf
SITE_CONF_SRC="$(mktemp -d "/tmp/${CONTAINER_NAME}-site-conf.d.XXXXXXX")"
trap 'rm -rf "${SITE_CONF_SRC}"' EXIT
SITE_CONF_DST=/etc/nginx/sites
cp rootfs/etc/nginx/sites/* "${SITE_CONF_SRC}"
sed "s/__HOST__/${HOST}/g" -i "${SITE_CONF_SRC}"/*

IMAGE=nginx:1.15.8
docker run \
    --detach \
    --publish 80:80 \
    --publish 443:443 \
    -v "${LETSENCRYPT_SRC}:${LETSENCRYPT_DEST}" \
    -v "${DHPARAM_SRC}:${DHPARAM_DEST}:ro" \
    -v "${NGINX_CONF_SRC}:${NGINX_CONF_DST}" \
    -v "${SITE_CONF_SRC}:${SITE_CONF_DST}" \
    -v "${BUILD_DIR}:/srv/http" \
    --network host \
    --name "${CONTAINER_NAME}" \
    "${IMAGE}"


# Build
copy_static_assets
cd "${TOP_DIR}"
NODE_ENV=development npm run watch
