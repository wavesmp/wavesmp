#!/bin/bash
#
# Deploy Mongo DB
# Restore DB data, certs, and waves config from s3 bucket
#

set -o errexit
set -o nounset
set -o pipefail

cd "$(dirname "$0")"

usage() {
    echo "Usage: $0 <bucket-name>"
    echo "  bucket-name - AWS backup S3 bucket name"
    exit 1
}

BACKUP_BUCKET="$1"

if [[ -z "${BACKUP_BUCKET}" ]]; then
    usage
fi

# Deploy mongo db if not present
DB_NAME=mongo
DB_IMAGE=mongo:3.6.6
if [[ -z "$(docker ps -a -q -f name="${DB_NAME}")" ]]; then
    docker run \
        -d \
        --net host \
        --name "${DB_NAME}" \
        "${DB_IMAGE}"
fi

# TODO wait for db to be up

# Create temp dir for downloads
DL_DIR="$(mktemp --tmpdir --directory waves-restore-server-XXXXXXX)"
trap 'rm -rf "${DL_DIR}"' EXIT

# Restore db data
DUMP_TAR=dump.tar.gz
aws s3 cp --quiet "s3://${BACKUP_BUCKET}/${DUMP_TAR}" "${DL_DIR}/${DUMP_TAR}"
docker cp "${DL_DIR}/${DUMP_TAR}" "mongo:/root/${DUMP_TAR}"
rm "${DL_DIR}/${DUMP_TAR}"
docker exec mongo bash -c "\
    cd /root && \
    if [[ -d /root/dump ]]; then \
        echo 'Warning: Database has already been restored' && \
        exit 0; \
    fi && \
    tar xf '${DUMP_TAR}' && \
    mongorestore"

# Restore certs, if not present
CERTS_TAR=certs.tar.gz
CERTS_DEST=packages/waves-client-web/rootfs/etc
if [[ -e "${CERTS_DEST}/letsencrypt" ]]; then
    echo "Warning: Certs already present in ${CERTS_DEST}/letsencrypt"
else
    aws s3 cp --quiet "s3://${BACKUP_BUCKET}/${CERTS_TAR}" "${DL_DIR}/${CERTS_TAR}"
    tar xC "${DL_DIR}" -f "${DL_DIR}/${CERTS_TAR}"
    rm "${DL_DIR}/${CERTS_TAR}"
    mv "${DL_DIR}"/etc/{letsencrypt,ssl} "${CERTS_DEST}"
    rm -r "${DL_DIR}"/*
fi

# Restore client config, if not present
CLIENT_CONFIG_SRC=waves-client-web-config.json
CLIENT_CONFIG_DST=packages/waves-client-web/src/config.json
if [[ -e "${CLIENT_CONFIG_DST}" ]]; then
    echo "Warning: Client config already present at ${CLIENT_CONFIG_DST}"
else
    aws s3 cp --quiet "s3://${BACKUP_BUCKET}/${CLIENT_CONFIG_SRC}" - \
        > "${CLIENT_CONFIG_DST}"
fi

# Restore server config, if not present
SERVER_CONFIG_SRC=waves-server-main-config.json
SERVER_CONFIG_DST=packages/waves-server-main/config.json
if [[ -e "${SERVER_CONFIG_DST}" ]]; then
    echo "Warning: Server config already present at ${SERVER_CONFIG_DST}"
else
    aws s3 cp --quiet "s3://${BACKUP_BUCKET}/${SERVER_CONFIG_SRC}" - \
        > "${SERVER_CONFIG_DST}"
fi
