#!/usr/bin/env bash
# Starts both halves of the PS4 stack for local dev: the Python ML
# microservice (ml-service, port 8008) and the Next.js app
# (police-evidence-platform, port 3000). Ctrl+C stops both.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ML_DIR="$ROOT_DIR/ml-service"
APP_DIR="$ROOT_DIR/police-evidence-platform"

if [ ! -d "$ML_DIR/.venv" ]; then
  echo "error: $ML_DIR/.venv not found — run the ml-service Setup steps in ml-service/README.md first" >&2
  exit 1
fi

if [ ! -d "$APP_DIR/node_modules" ]; then
  echo "error: $APP_DIR/node_modules not found — run 'npm install' in police-evidence-platform first" >&2
  exit 1
fi

PIDS=()
cleanup() {
  echo ""
  echo "Stopping..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "==> Starting ml-service on http://127.0.0.1:8008"
(
  cd "$ML_DIR"
  # shellcheck disable=SC1091
  source .venv/bin/activate
  exec uvicorn main:app --host 127.0.0.1 --port 8008
) &
PIDS+=("$!")

echo "==> Starting Next.js app on http://localhost:3000"
(
  cd "$APP_DIR"
  exec npm run dev
) &
PIDS+=("$!")

echo ""
echo "Both services starting. Press Ctrl+C to stop both."
echo "  - ML service health check: curl http://127.0.0.1:8008/health"
echo "  - App:                     http://localhost:3000"
echo ""

wait
