#!/bin/bash
#
# Restore DB, certs, and waves config from an S3 bucket
#

set -o errexit
set -o nounset
set -o pipefail

cd "$(dirname "$0")"

source common.sh

[[ "$#" != 1 ]] && usage
BACKUP_BUCKET="$1"
[[ -z "${BACKUP_BUCKET}" ]] && usage

BACKUP_VERSION="$(get_latest_backup_version)"
BACKUP_URL="s3://${BACKUP_BUCKET}/${BACKUP_VERSION}"
echo "Using backup version ${BACKUP_VERSION}"


# Create mongo db volume if not present
DB_VOLUME_NAME=mongodata
if [[ -z "$(docker volume ls -q -f name="${DB_VOLUME_NAME}")" ]]; then
    docker volume create "${DB_VOLUME_NAME}"
else
    echo "Docker volume ${DB_VOLUME_NAME} already present"
fi


# Deploy mongo db if not present
DB_NAME=mongo
DB_IMAGE=mongo:3.6.6
DB_VOLUME_DEST=/data/db
# Mongo docker image defaults to --bind_ip_all flag
# Restrict to localhost since we run DB on host network
# See https://github.com/docker-library/mongo/pull/226
DB_EXTRA_ARGS=("--bind_ip" "127.0.0.1")
if [[ -z "$(docker ps -a -q -f name="${DB_NAME}")" ]]; then
    docker run \
        -d \
        --net host \
        --name "${DB_NAME}" \
        --mount "type=volume,src=${DB_VOLUME_NAME},dst=${DB_VOLUME_DEST},volume-driver=local" \
        "${DB_IMAGE}" \
        "${DB_EXTRA_ARGS[@]}"
else
    echo "Database already running"
fi


DB_PORT=27017
wait_for_port_listen "${DB_PORT}"


# Create temp dir for downloads
DL_DIR="$(mktemp --tmpdir --directory waves-restore-server-XXXXXXX)"
trap 'rm -rf "${DL_DIR}"' EXIT


# Restore db data
aws s3 cp --quiet "${BACKUP_URL}/${DB_DUMP_TAR}" "${DL_DIR}/${DB_DUMP_TAR}"
docker cp "${DL_DIR}/${DB_DUMP_TAR}" "${DB_NAME}:${DB_DUMP_WD}/${DB_DUMP_TAR}"
rm "${DL_DIR}/${DB_DUMP_TAR}"
docker exec "${DB_NAME}" bash -c "\
    cd '${DB_DUMP_WD}' && \
    if [[ -d '${DB_DUMP_DIR}' ]]; then \
        echo 'Database has already been restored' && \
        exit 0; \
    fi && \
    tar xf '${DB_DUMP_TAR}' && \
    mongorestore && \
    echo 'Restored database'"


# Restore certs, if not present
CERTS_DEST="${PACKAGES_DIR}/waves-client-web/rootfs/etc"
if [[ -e "${CERTS_DEST}/letsencrypt" ]]; then
    echo "Certs already present in ${CERTS_DEST}/letsencrypt"
else
    aws s3 cp --quiet "${BACKUP_URL}/${CERTS_TAR}" "${DL_DIR}/${CERTS_TAR}"
    tar xC "${DL_DIR}" -f "${DL_DIR}/${CERTS_TAR}"
    rm "${DL_DIR}/${CERTS_TAR}"
    mv "${DL_DIR}"/etc/{letsencrypt,ssl} "${CERTS_DEST}"
    rm -r "${DL_DIR}"/*
    echo "Restored certs"
fi


# Restore client config, if not present
if [[ -e "${CLIENT_CONFIG_FILE}" ]]; then
    echo "Client config already present at ${CLIENT_CONFIG_FILE}"
else
    aws s3 cp --quiet "${BACKUP_URL}/${CLIENT_CONFIG_BACKUP_FILE}" - \
        > "${CLIENT_CONFIG_FILE}"
    echo "Restored client config"
fi


# Restore server config, if not present
if [[ -e "${SERVER_CONFIG_FILE}" ]]; then
    echo "Server config already present at ${SERVER_CONFIG_FILE}"
else
    aws s3 cp --quiet "${BACKUP_URL}/${SERVER_CONFIG_BACKUP_FILE}" - \
        > "${SERVER_CONFIG_FILE}"
    echo "Restored server config"
fi
