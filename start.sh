#!/bin/sh
set -e

export PORT="${PORT:-10000}"
export BACKEND_URL="${BACKEND_URL:-http://backend:5000/api/}"

echo "Starting container on PORT: $PORT..."
echo "Backend API Proxy Target: $BACKEND_URL"

mkdir -p /etc/nginx/conf.d

# Thay thế biến ${PORT} và ${BACKEND_URL} vào cấu hình Nginx
envsubst '${PORT} ${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

echo "Checking Nginx configuration..."
nginx -t

echo "Starting Nginx reverse proxy..."
exec nginx -g "daemon off;"