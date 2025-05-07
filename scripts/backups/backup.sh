#!/bin/bash
#
# Back up DB volume and config to an S3 bucket
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
BACKUP_VERSION="$(get_new_backup_version "${BACKUP_PREFIX}")"
BACKUP_URL="${BACKUP_PREFIX}/${BACKUP_VERSION}"
echo "Using backup version ${BACKUP_VERSION}"

# Create temp dir for staging uploads
UPLOAD_DIR="$(mktemp --tmpdir --directory waves-backup--XXXXXXX)"
trap 'rm --recursive --force "${UPLOAD_DIR}"' EXIT

# Back up client config
aws s3 cp --quiet "${CLIENT_CONFIG_FILE}" \
    "${BACKUP_URL}/${CLIENT_CONFIG_BACKUP_FILE}"
echo "Backed up web client config"
