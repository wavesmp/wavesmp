BACKUP_VERSION_REGEX='^\d{3}$'
BACKUP_VERSION_FORMAT='%03d'

DB_DUMP_TAR=dump.tar.gz
DB_DUMP_FILE=dump.sql
DB_DUMP_WD=/root
DB_NAME=wavesmp-waves-server-sql-1
DB_VOLUME_NAME=wavesmp_waves-server-sql
DB_RESTORE_NAME="${DB_NAME}_restore"
DB_IMAGE=mysql:8.4.0-oraclelinux9
DB_VOLUME_DEST=/var/lib/mysql

PACKAGES_DIR=../../packages

CLIENT_CONFIG_FILE="${PACKAGES_DIR}/waves-client-web/src/config.js"
SERVER_CONFIG_FILE="${PACKAGES_DIR}/waves-server-rust/config.json"
CLIENT_CONFIG_BACKUP_FILE=waves-client-web-config.js
SERVER_CONFIG_BACKUP_FILE=waves-server-rust-config.json

usage() {
    echo "Usage: $0 <bucket-name>"
    echo "  bucket-name - AWS backup S3 bucket name (e.g. foo.bar.com)"
    exit 1
}

# https://stackoverflow.com/questions/27599839/
# how-to-wait-for-an-open-port-with-netcat
wait_for_port_listen_in_container() {
  local container="$1"
  local port="$2"

  docker exec \
    --interactive \
    --tty \
    "${container}" \
    bash -c "
    set -o errexit
    set -o nounset
    set -o pipefail

    while ! timeout 2 bash -c '< /dev/tcp/localhost/${port}' > /dev/null 2>&1; do
        echo 'Waiting for port ${port} to listen'
        sleep 3
    done
    "
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
      ((backup_version+=1))
      printf "${BACKUP_VERSION_FORMAT}" "${backup_version}"
  fi
}
