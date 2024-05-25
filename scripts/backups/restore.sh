#!/bin/bash
#
# Restore DB volume and config from an S3 bucket
#
# Requirements:
# - aws CLI
#

set -o errexit
set -o nounset
set -o pipefail

cd "$(dirname "$0")"

source common.sh

# Parse arguments
[[ "$#" != 1 ]] && usage
BACKUP_BUCKET="$1"
[[ -z "${BACKUP_BUCKET}" ]] && usage

# Get new backup version
BACKUP_PREFIX="s3://${BACKUP_BUCKET}/waves"
BACKUP_VERSION="$(get_latest_backup_version "${BACKUP_PREFIX}")"
BACKUP_URL="${BACKUP_PREFIX}/${BACKUP_VERSION}"
echo "Using backup version ${BACKUP_VERSION}"

# Restore the db volume if not present
if [[ -n "$(docker volume ls --quiet --filter name="${DB_VOLUME_NAME}")" ]]; then
  echo "Docker volume ${DB_VOLUME_NAME} already present"
else

  # Create the volume
  docker volume create "${DB_VOLUME_NAME}"

  # Deploy the db
  docker run \
    --detach \
    --interactive \
    --tty \
    --name "${DB_RESTORE_NAME}" \
    --mount "type=volume,src=${DB_VOLUME_NAME},dst=${DB_VOLUME_DEST},volume-driver=local" \
    --env MYSQL_ROOT_PASSWORD=root \
    "${DB_IMAGE}"

  # Wait for db to come up
  DB_PORT=3306
  wait_for_port_listen_in_container "${DB_RESTORE_NAME}" "${DB_PORT}"

  # Create temp dir for downloads
  DL_DIR="$(mktemp --tmpdir --directory waves-restore-XXXXXXX)"
  trap 'rm --recursive --force "${DL_DIR}"' EXIT

  # Restore db data
  aws s3 cp --quiet "${BACKUP_URL}/${DB_DUMP_TAR}" "${DL_DIR}/${DB_DUMP_TAR}"
  docker cp "${DL_DIR}/${DB_DUMP_TAR}" "${DB_RESTORE_NAME}:${DB_DUMP_WD}/${DB_DUMP_TAR}"
  rm "${DL_DIR}/${DB_DUMP_TAR}"
  docker exec "${DB_RESTORE_NAME}" bash -c "
    set -o errexit
    set -o nounset
    set -o pipefail

    cd '${DB_DUMP_WD}'
    tar xf '${DB_DUMP_TAR}'
    mysql -u root -proot < dump.sql
    echo 'Restored database'
    "
  docker stop "${DB_RESTORE_NAME}"
  docker rm "${DB_RESTORE_NAME}"
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
