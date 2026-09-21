# ==========================================
# Stage 1: Build Frontend (React + Vite)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies definitions
COPY package*.json ./

# Cài đặt dependencies (bao gồm cả devDependencies để build)
RUN npm ci

# Copy toàn bộ mã nguồn vào container
COPY . .

# Định nghĩa ARG và ENV cho VITE_API_URL để Vite compile đúng baseURL /api
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build production bundle
RUN npm run build

# ==========================================
# Stage 2: Production Container (Nginx + json-server)
# ==========================================
FROM node:20-alpine AS runner

# Cài đặt Nginx và gettext (để sử dụng envsubst)
RUN apk add --no-cache nginx gettext

WORKDIR /app

# Cài đặt runtime dependencies cho json-server
COPY package*.json ./
RUN npm ci --omit=dev

# Copy database file
COPY db.json ./

# Copy static assets đã build từ Stage 1 sang thư mục web của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy cấu hình Nginx template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Copy script khởi động và cấp quyền thực thi
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Cổng mặc định cho Render / Docker
EXPOSE 10000

# Khởi chạy ứng dụng qua start.sh
CMD ["/app/start.sh"]