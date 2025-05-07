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

# Restore client config, if not present
if [[ -e "${CLIENT_CONFIG_FILE}" ]]; then
    echo "Client config already present at ${CLIENT_CONFIG_FILE}"
else
    aws s3 cp --quiet "${BACKUP_URL}/${CLIENT_CONFIG_BACKUP_FILE}" - \
        > "${CLIENT_CONFIG_FILE}"
    echo "Restored client config"
fi
