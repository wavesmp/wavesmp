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

DB_PVC_NAME="$($KUBECTL get pvc/mysql --output name --ignore-not-found)"

# Restore the db volume if not present
if [[ -n "${DB_PVC_NAME}" ]]; then
  echo "pvc/mysql already present. Skipping backup restore"
else
  echo "Restoring backup"

  $KUBECTL apply --server-side -f "${K8S_DIR}/namespace.yaml"
  $KUBECTL apply --server-side -f "${K8S_DIR}/mysql-pvc.yaml"
  $KUBECTL apply --server-side -f ./mysql-restore-deployment.yaml

  $KUBECTL wait deployments --all --for=condition=Available --timeout=15m

  DB_POD_NAME="$($KUBECTL get pods --selector app=mysql-restore --output name)"

  # Create temp dir for downloads
  DL_DIR="$(mktemp --tmpdir --directory waves-restore-XXXXXXX)"
  trap 'rm --recursive --force "${DL_DIR}"' EXIT

  # Restore db data
  aws s3 cp --quiet "${BACKUP_URL}/${DB_DUMP_TAR}" "${DL_DIR}/${DB_DUMP_TAR}"
  $KUBECTL cp "${DL_DIR}/${DB_DUMP_TAR}" "${DB_POD_NAME##pod/}:${DB_DUMP_WD}/${DB_DUMP_TAR}"
  rm "${DL_DIR}/${DB_DUMP_TAR}"
  $KUBECTL exec "${DB_POD_NAME}" -- bash -c "
    set -o errexit
    set -o nounset
    set -o pipefail

    echo 'Waiting for mysql to come up'

    while ! timeout 2 bash -c '< /dev/tcp/localhost/${DB_PORT}' > /dev/null 2>&1; do
        echo 'Waiting for port ${DB_PORT} to listen'
        sleep 3
    done

    cd '${DB_DUMP_WD}'
    tar xf '${DB_DUMP_TAR}'
    mysql -u root -proot < '${DB_DUMP_FILE}'
    rm '${DB_DUMP_FILE}' '${DB_DUMP_TAR}'

    echo 'Restored database'
    "

    $KUBECTL delete -f ./mysql-restore-deployment.yaml
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

# Restore server config map, if not present
if [[ -e "${SERVER_CONFIG_MAP_FILE}" ]]; then
    echo "Server config map already present at ${SERVER_CONFIG_MAP_FILE}"
else
    aws s3 cp --quiet "${BACKUP_URL}/${SERVER_CONFIG_MAP_BACKUP_FILE}" - \
        > "${SERVER_CONFIG_FILE}"
    echo "Restored server config map"
fi
