#!/bin/sh
set -e

# Cấu hình cổng PORT mặc định là 10000 nếu không được truyền từ Render/Docker
export PORT="${PORT:-10000}"

echo "Starting container on PORT: $PORT..."

# Thay thế biến ${PORT} trong nginx.conf template mà không ảnh hưởng tới các biến nginx khác
mkdir -p /etc/nginx/http.d /etc/nginx/conf.d
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/http.d/default.conf
cp /etc/nginx/http.d/default.conf /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Khởi động json-server ở background trên port 8000
echo "Starting json-server with db.json on port 8000..."
npx json-server --watch db.json --port 8000 --host 0.0.0.0 &

# Khởi động Nginx ở foreground
echo "Starting Nginx reverse proxy..."
exec nginx -g "daemon off;"
