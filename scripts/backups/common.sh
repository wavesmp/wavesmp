BACKUP_VERSION_REGEX='^\d{3}$'
BACKUP_VERSION_FORMAT='%03d'

PACKAGES_DIR=../../packages
K8S_DIR=../../k8s

CLIENT_CONFIG_FILE="${PACKAGES_DIR}/waves-client-web/src/config.js"
CLIENT_CONFIG_BACKUP_FILE=waves-client-web-config.js

usage() {
    echo "Usage: $0 <bucket-name>"
    echo "  bucket-name - AWS backup S3 bucket name (e.g. foo.bar.com)"
    exit 1
}

get_backup_versions() {
  local prefix="$1"
  aws s3 ls "${prefix}/" | \
    grep PRE | \
    awk '{ print $2 }' | \
    tr -d / | \
    grep -P "${BACKUP_VERSION_REGEX}"  | \
    sort
}

get_latest_backup_version() {
  local prefix="$1"
  get_backup_versions "${prefix}" | tail -n 1
}

get_new_backup_version() {
  local prefix="$1"
  local backup_version="$(get_latest_backup_version "${prefix}")"

  if [[ -z "${backup_version}" ]]; then
      echo -n 000
  else
      backup_version="$((10#${backup_version} + 1))"
      printf "${BACKUP_VERSION_FORMAT}" "${backup_version}"
  fi
}
