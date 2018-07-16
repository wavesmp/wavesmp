#!/bin/bash
#
# Renew letsencrypt certs
#
# Expected to run within the server containing letsencrypt certs
#

set -o errexit
set -o nounset
set -o pipefail


NAME=waves-client-web

if [[ -z "$(sudo docker ps -a -q -f name="${NAME}")" ]]; then
    echo "Error: Did not find container: ${NAME}"
fi

sudo docker exec -it ${NAME} /bin/bash -c \
    'apt-get update && apt-get install python-certbot-nginx && certbot renew'
    # 'certbot renew'
