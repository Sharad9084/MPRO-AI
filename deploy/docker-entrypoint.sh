#!/bin/sh
set -eu

python -m api.server &
API_PID=$!

cleanup() {
    kill "$API_PID" 2>/dev/null || true
    wait "$API_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

nginx -g "daemon off;"
