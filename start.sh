#!/bin/sh
set -e

export PORT="${PORT:-10000}"

echo "Starting container on PORT: $PORT..."

# Thư mục chuẩn chứa server block trong http {} của Alpine Linux là /etc/nginx/http.d
mkdir -p /etc/nginx/http.d

# Thay thế biến ${PORT} vào cấu hình Nginx
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/http.d/default.conf

# Xóa file trong conf.d nếu có để tránh Nginx include ngoài http block
rm -f /etc/nginx/conf.d/default.conf

echo "Checking Nginx configuration..."
nginx -t

echo "Starting json-server with db.json on port 8000..."
npx json-server --watch db.json --port 8000 --host 0.0.0.0 &

echo "Starting Nginx reverse proxy..."
exec nginx -g "daemon off;"