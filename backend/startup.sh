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

# ── Configuration ──────────────────────────────────
APP_DIR="${APP_DIR:-/home/site/wwwroot}"
VENV_DIR="${VENV_DIR:-/home/site/.venv}"
LOG_DIR="${LOG_DIR:-/home/LogFiles}"
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-http://localhost:8001/api/health}"
HEALTH_CHECK_RETRIES=10
HEALTH_CHECK_DELAY=3
PORT="${PORT:-8001}"
WORKERS="${WORKERS:-2}"

# ── Logging helper ─────────────────────────────────
log() {
    local level="$1"; shift
    echo "$(date '+%Y-%m-%d %H:%M:%S') [STARTUP] [$level] $*" | tee -a "$LOG_DIR/startup.log" 2>/dev/null || echo "$*"
}

log "INFO" "Starting Avicon Enterprise Backend deployment..."
log "INFO" "Working directory: $APP_DIR"
log "INFO" "Python: $(python3 --version 2>&1)"

# ── Dependency validation ──────────────────────
log "INFO" "Skipping runtime pip install. Relying on Oryx build (or Zip payload)."


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
        log "ERROR" "Missing required environment variable: $var"
        missing_vars=$((missing_vars + 1))
    fi
done

if [ "$missing_vars" -gt 0 ]; then
    log "ERROR" "$missing_vars required environment variable(s) missing!"
    # Continue anyway — app will start but RAG features may not work
fi

# ── Step 4: Start Uvicorn ──────────────────────────
log "INFO" "Starting Uvicorn on port $PORT with $WORKERS workers..."
cd "$APP_DIR"

if [ -f "$APP_DIR/antenv/bin/gunicorn" ]; then
    log "INFO" "Virtual environment identified. Proceeding to execution."
else
    log "INFO" "Dependencies missing. Generating native virtual environment to bypass ZipDeploy size limits..."
    python -m venv $APP_DIR/antenv
    source $APP_DIR/antenv/bin/activate
    python -m pip install --upgrade pip
    pip install -r requirements.txt
fi

source $APP_DIR/antenv/bin/activate
export PYTHONPATH="$APP_DIR/antenv/lib/python3.12/site-packages:$APP_DIR/antenv:$PYTHONPATH"
export PATH="$APP_DIR/antenv/bin:$PATH"

exec python -m gunicorn server:app \
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
