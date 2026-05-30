#!/bin/bash
# Keep-alive daemon for tripsim demo
# Monitors Vite dev server + serveo tunnel, auto-restarts on failure

VITE_PORT=4174
SUBDOMAIN=tripsim

cleanup() {
  echo "[$(date)] Shutting down..."
  pkill -f "vite.*$VITE_PORT" 2>/dev/null
  pkill -f "ssh.*serveo" 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "[$(date)] ===== tripsim keepalive started ====="

while true; do
  # --- Watch Vite ---
  if ! curl -s -o /dev/null "http://localhost:$VITE_PORT" 2>/dev/null; then
    echo "[$(date)] Vite down, restarting..."
    pkill -f "vite" 2>/dev/null
    sleep 1
    cd "$(dirname "$0")" && npx vite --port $VITE_PORT --host 0.0.0.0 &
    sleep 4
  fi

  # --- Watch Tunnel ---
  if ! pgrep -f "ssh.*serveo" >/dev/null 2>&1; then
    echo "[$(date)] Tunnel down, restarting..."
    ssh -o StrictHostKeyChecking=no \
        -o ServerAliveInterval=30 \
        -o ServerAliveCountMax=3 \
        -o ExitOnForwardFailure=yes \
        -R $SUBDOMAIN:80:localhost:$VITE_PORT serveo.net &
    sleep 6
  fi

  # Health check
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://${SUBDOMAIN}.serveousercontent.com" 2>/dev/null)
  echo "[$(date)] Health: local=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:$VITE_PORT) public=$STATUS"

  sleep 15
done
