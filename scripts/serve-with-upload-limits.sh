#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXTRA_SCAN_DIR="${ROOT_DIR}/.php-cli-conf"
DEFAULT_SCAN_DIR="$(php --ini | sed -n 's/^Scan for additional \.ini files in: *//p' | xargs)"

if [[ -n "${DEFAULT_SCAN_DIR}" && "${DEFAULT_SCAN_DIR}" != "(none)" ]]; then
    export PHP_INI_SCAN_DIR="${DEFAULT_SCAN_DIR}:${EXTRA_SCAN_DIR}"
else
    export PHP_INI_SCAN_DIR="${EXTRA_SCAN_DIR}"
fi

exec php artisan serve --no-reload "$@"

