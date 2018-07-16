#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail


NAME=waves-client-web

# Usually, the container only need read access to the files below.
# However, since it's convenient to renew the the certs within
# the container (for now), pass the entire letsencrypt conf
#   CERT=/etc/letsencrypt/live/__HOST__/fullchain.pem
#   KEY=/etc/letsencrypt/live/__HOST__/privkey.pem

LETSENCRYPT_CONF=/etc/letsencrypt
DHPARAM=/etc/ssl/certs/dhparam.pem

if [[ ! -z "$(sudo docker ps -a -q -f name="${NAME}")" ]]; then
	sudo docker stop "${NAME}"
	sudo docker rm "${NAME}"
fi

sudo docker run \
    -d \
    -p 80:80 \
    -p 443:443 \
    -v "${LETSENCRYPT_CONF}:${LETSENCRYPT_CONF}" \
    -v "${DHPARAM}:${DHPARAM}:ro" \
    --net host \
    --name "${NAME}" \
    "${NAME}"
