BACKUP_VERSION_REGEX='^\d{3}$'
BACKUP_VERSION_FORMAT='%03d'

DB_DUMP_TAR=dump.tar.gz
DB_DUMP_DIR=dump
DB_DUMP_WD=/root
DB_NAME=mongo

CERTS_TAR=certs.tar.gz

PACKAGES_DIR=../packages

CLIENT_CONFIG_FILE="${PACKAGES_DIR}/waves-client-web/src/config.js"
SERVER_CONFIG_FILE="${PACKAGES_DIR}/waves-server-main/config.js"
CLIENT_CONFIG_BACKUP_FILE=waves-client-web-config.js
SERVER_CONFIG_BACKUP_FILE=waves-server-main-config.js

usage() {
    echo "Usage: $0 <bucket-name>"
    echo "  bucket-name - AWS backup S3 bucket name"
    exit 1
}


# https://stackoverflow.com/questions/27599839/
# how-to-wait-for-an-open-port-with-netcat
wait_for_port_listen() {
    local port="$1"

	while ! nc -z localhost "${port}"; do
        echo "Waiting for port ${port} to listen"
	    sleep 3
	done
}

get_backup_versions() {
    aws s3 ls "s3://${BACKUP_BUCKET}/" | \
        grep PRE | \
        awk '{ print $2 }' | \
        tr -d / | \
        grep -P "${BACKUP_VERSION_REGEX}"  | \
        sort
}


get_latest_backup_version() {
    get_backup_versions | tail -n 1
}

get_new_backup_version() {
    local backup_version="$(get_latest_backup_version)"

    if [[ -z "${backup_version}" ]]; then
        echo -n 000
    else
        ((backup_version+=1))
        printf "${BACKUP_VERSION_FORMAT}" "${backup_version}"
    fi
}
