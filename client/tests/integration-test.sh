#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail


if [[ "$#" != 1 ]]; then
  echo "Usage: $0 <WAVESMP_BASE_URL>"
  exit 1
fi

WAVESMP_URL="$1"

# Create temp dir for test output
TEST_DIR="$(mktemp -d /tmp/wavesmp-integration-test.XXXXXX)"
trap 'rm -rf "${TEST_DIR}"' EXIT

# Helper function for making requests
req() {
  curl \
    --silent \
    --show-error \
    --fail \
    "$@"
}

test_landing_page() {
  echo -n "Test landing page... "
  TEST_FILE="${TEST_DIR}/landing-page.html"

  if ! req "${WAVESMP_URL}" \
    | tee "${TEST_FILE}" \
    | grep --fixed-strings --line-regexp '<!doctype html>' \
    > /dev/null
  then
    echo "FAIL: Did not find html doctype declaration in landing page"
    echo "--> Full response:"
    cat "${TEST_FILE}"
    echo "<-- End response."
    echo
    return 1
  fi

  echo "PASS"
  return 0
}

# curl -sSf http://127.0.0.1:8080/csp-rust --data '{"foo": "bar"}'
test_csp_api() {
  echo -n "Test CSP API... "
  TEST_FILE="${TEST_DIR}/csp.txt"

  if ! req --data '{"source": "waves-integration-test" }' \
    "${WAVESMP_URL}/csp-rust" \
    | tee "${TEST_FILE}"
  then
    echo "FAIL: Error response while posting csp data"
    echo "--> Full response:"
    cat "${TEST_FILE}"
    echo "<-- End response."
    echo
    return 1
  fi

  echo "PASS"
  return 0
}

echo "Running integration tests using URL: ${WAVESMP_URL}"
test_landing_page
test_csp_api
