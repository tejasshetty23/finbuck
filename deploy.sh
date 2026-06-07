#!/usr/bin/env bash
# Auto-deploy script for the FinBuck site on a VPS.
# Pulls the latest code/data from GitHub, rebuilds, and restarts the app.
# Run it on a daily cron so monthly resets and history updates land automatically.

set -e

# --- Edit this to match where you cloned the repo on the VPS ---
APP_DIR="/var/www/finbuck"
# --------------------------------------------------------------

cd "$APP_DIR"

echo "[$(date)] Checking for updates..."

git fetch origin main

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "[$(date)] Already up to date. Nothing to do."
  exit 0
fi

echo "[$(date)] New changes found — deploying..."

git pull origin main
npm install --omit=dev
npm run build

# Restart via PM2 (app must have been started once as "finbuck")
pm2 restart finbuck

echo "[$(date)] Deploy complete."
