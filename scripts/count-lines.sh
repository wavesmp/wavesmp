#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset


cd "$(dirname "$0")"

# Change to top directory
cd ..

fd --type file --exclude package-lock.json --exec-batch wc -l | \
    sort --reverse --numeric-sort
