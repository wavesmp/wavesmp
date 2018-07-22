#!/bin/bash
#
# Back up server state to an S3 bucket
# - Database data
# - Certs
# - Waves config files
#

set -o errexit
set -o nounset
set -o pipefail

cd "$(dirname "$0")"

source common.sh

[[ "$#" != 1 ]] && usage
BACKUP_BUCKET="$1"
[[ -z "${BACKUP_BUCKET}" ]] && usage

BACKUP_VERSION="$(get_new_backup_version)"
BACKUP_URL="s3://${BACKUP_BUCKET}/${BACKUP_VERSION}"
echo "Using backup version ${BACKUP_VERSION}"


# Create temp dir for downloads
UPLOAD_DIR="$(mktemp --tmpdir --directory waves-backup-server-XXXXXXX)"
trap 'rm -rf "${UPLOAD_DIR}"' EXIT


# Back up db data
docker exec "${DB_NAME}" bash -c "\
    cd '${DB_DUMP_WD}' && \
    rm -rf '${DB_DUMP_TAR}' '${DB_DUMP_DIR}' && \
    mongodump && \
    tar -czf '${DB_DUMP_TAR}' '${DB_DUMP_DIR}'"
docker cp "${DB_NAME}:${DB_DUMP_WD}/${DB_DUMP_TAR}" "${UPLOAD_DIR}/${DB_DUMP_TAR}"
aws s3 cp --quiet "${UPLOAD_DIR}/${DB_DUMP_TAR}" "${BACKUP_URL}/${DB_DUMP_TAR}"
rm -f "${UPLOAD_DIR}/${DB_DUMP_TAR}"
echo "Backed up database"


# Back up certs
mkdir -p "${UPLOAD_DIR}/etc"
pushd "${UPLOAD_DIR}"
cp -r "${PACKAGES_DIR}/waves-client-web/rootfs/etc/"{letsencrypt,ssl} \
    "${UPLOAD_DIR}/etc"
tar -czf "${CERTS_TAR}" etc
aws s3 cp --quiet "${CERTS_TAR}" "${BACKUP_URL}/${CERTS_TAR}"
rm -rf "${CERTS_TAR}" etc
popd
echo "Backed up certs"


# Back up client config
aws s3 cp --quiet "${CLIENT_CONFIG_FILE}" \
    "${BACKUP_URL}/${CLIENT_CONFIG_BACKUP_FILE}"
echo "Backed up web client config"


# Back up server config
aws s3 cp --quiet "${SERVER_CONFIG_FILE}" \
    "${BACKUP_URL}/${SERVER_CONFIG_BACKUP_FILE}"
echo "Backed up server config"
