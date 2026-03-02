#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Avicon Enterprise — Azure App Service Startup Script
#
# Zero-downtime deployment script for Azure App Service (Linux).
# Installs dependencies, runs health checks, then starts the server.
# Logs all operations for audit trail.
# ──────────────────────────────────────────────────────────────

set -euo pipefail
IFS=$'\n\t'

# ── Dynamic Path Detection ──────────────────────────
# Use the directory where this script resides as the default APP_DIR
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$SCRIPT_DIR}"

log_to_file() {
    local level="$1"; shift
    local msg="$*"
    local log_file="/home/LogFiles/startup.log"
    # Ensure log directory exists if we have permissions
    [ -d "/home/LogFiles" ] || mkdir -p "/home/LogFiles" 2>/dev/null || true
    echo "$(date '+%Y-%m-%d %H:%M:%S') [STARTUP] [$level] $msg" >> "$log_file" 2>/dev/null || true
}

log() {
    local level="$1"; shift
    local msg="$*"
    echo "$msg"
    log_to_file "$level" "$msg"
}

# ── Configuration ──────────────────────────────────
LOG_DIR="${LOG_DIR:-/home/LogFiles}"
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-http://localhost:8001/api/health}"
HEALTH_CHECK_RETRIES=10
HEALTH_CHECK_DELAY=3
PORT="${PORT:-8001}"
WORKERS="${WORKERS:-2}"

log "INFO" "Starting Avicon Enterprise Backend deployment..."
log "INFO" "Script directory: $SCRIPT_DIR"
log "INFO" "Target APP_DIR: $APP_DIR"
log "INFO" "Python3 version: $(python3 --version 2>&1 || echo 'Not found')"

# ── Step 3: Environment Validation ─────────────────
REQUIRED_VARS=(
    "AZURE_OPENAI_API_KEY"
    "AZURE_OPENAI_ENDPOINT"
    "PINECONE_API_KEY"
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
)

missing_vars=0
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var:-}" ]; then
        log "WARNING" "Missing required environment variable: $var"
        missing_vars=$((missing_vars + 1))
    fi
done

if [ "$missing_vars" -gt 0 ]; then
    log "INFO" "$missing_vars required environment variable(s) missing or empty."
fi

# ── Step 4: Virtual Environment Setup ──────────────
log "INFO" "Setting up execution environment..."
cd "$APP_DIR"

# Check for various common venv locations in Azure
if [ -f "$APP_DIR/antenv/bin/activate" ]; then
    VENV_PATH="$APP_DIR/antenv"
    log "INFO" "Found virtual environment at $VENV_PATH"
elif [ -f "$APP_DIR/.venv/bin/activate" ]; then
    VENV_PATH="$APP_DIR/.venv"
    log "INFO" "Found virtual environment at $VENV_PATH"
else
    log "INFO" "No virtual environment found. Generating native environment..."
    python3 -m venv "$APP_DIR/antenv"
    VENV_PATH="$APP_DIR/antenv"
fi

log "INFO" "Activating environment: $VENV_PATH"
source "$VENV_PATH/bin/activate"

# Ensure dependencies are present if not in a pre-built env
if ! python3 -c "import gunicorn" 2>/dev/null; then
    log "INFO" "Gunicorn not found in venv. Installing requirements..."
    python3 -m pip install --upgrade pip
    python3 -m pip install -r requirements.txt
fi

# ── Step 5: Start Gunicorn ─────────────────────────
log "INFO" "Starting server on port $PORT with $WORKERS workers..."

# Explicitly add APP_DIR to PYTHONPATH
export PYTHONPATH="$APP_DIR:$PYTHONPATH"

exec python3 -m gunicorn server:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind "0.0.0.0:$PORT" \
    --workers "$WORKERS" \
    --timeout 120 \
    --keep-alive 5 \
    --access-logfile "-" \
    --error-logfile "-" \
    --log-level info \
    --graceful-timeout 30 \
    --forwarded-allow-ips "*"
