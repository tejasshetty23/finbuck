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

# Dev deps are required to BUILD, not just to develop: typescript and @types/*
# compile the app, and tailwindcss/postcss compile globals.css. Installing with
# --omit=dev produced a build with no stylesheet at all.
npm install --include=dev

# `next build` clears .next before it finishes, so a failed build leaves the
# running app serving asset URLs that no longer exist on disk (404/400 on every
# chunk). Keep the previous build and put it back if this one doesn't complete.
rm -rf .next.prev
if [ -d .next ]; then
  cp -a .next .next.prev
fi

if ! npm run build; then
  echo "[$(date)] Build FAILED — restoring previous build, not restarting."
  rm -rf .next
  if [ -d .next.prev ]; then
    mv .next.prev .next
  fi
  exit 1
fi

# A build can exit 0 yet emit no stylesheet, which breaks the site just as badly.
if ! ls .next/static/css/*.css >/dev/null 2>&1; then
  echo "[$(date)] Build produced no CSS — restoring previous build, not restarting."
  rm -rf .next
  if [ -d .next.prev ]; then
    mv .next.prev .next
  fi
  exit 1
fi

rm -rf .next.prev

# Restart via PM2 (app must have been started once as "finbuck")
pm2 restart finbuck

echo "[$(date)] Deploy complete."
