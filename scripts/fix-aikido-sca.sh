#!/usr/bin/env bash
# Replaces a corrupt Aikido SCA binary (segfault / bad SHA) with a working Trivy build.
# Run from a normal WSL/terminal (not the sandboxed agent shell):
#   bash scripts/fix-aikido-sca.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ROOT}/.tools/aikido-sca"
DEST_DIR="${HOME}/.cursor-server/extensions/aikidosecurity.aikido-1.0.125-universal/out/sca/dist"
DEST="${DEST_DIR}/aikido-sca"

if [[ ! -x "${SRC}" ]]; then
  echo "Missing executable: ${SRC}" >&2
  exit 1
fi

if [[ ! -d "${DEST_DIR}" ]]; then
  echo "Aikido extension SCA dir not found: ${DEST_DIR}" >&2
  echo "Install/update the Aikido extension, then re-run." >&2
  exit 1
fi

if [[ -f "${DEST}" ]]; then
  BAK="/tmp/aikido-sca.corrupt.bak.$(date +%s)"
  cp -a "${DEST}" "${BAK}"
  echo "Backup: ${BAK}"
fi

install -m 755 "${SRC}" "${DEST}"
echo "Installed: ${DEST} ($(stat -c%s "${DEST}") bytes)"
"${DEST}" version

CACHE="${HOME}/.cursor-server/extensions/aikidosecurity.aikido-1.0.125-universal/out/sca/trivy-db-cache"
echo "Smoke-testing fs scan..."
"${DEST}" fs "${ROOT}" -f json --scanners vuln --list-all-pkgs \
  --cache-dir "${CACHE}" --skip-db-update >/tmp/aikido-sca-smoke.json 2>/tmp/aikido-sca-smoke.err \
  || true
if [[ -s /tmp/aikido-sca-smoke.json ]]; then
  echo "OK: SCA scan produced JSON ($(wc -c </tmp/aikido-sca-smoke.json) bytes)"
else
  echo "WARN: smoke scan empty — see /tmp/aikido-sca-smoke.err"
  sed -n '1,40p' /tmp/aikido-sca-smoke.err || true
fi

echo "Done. Reload Cursor window and re-run Aikido SCA."
