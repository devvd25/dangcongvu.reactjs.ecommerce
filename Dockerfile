# ==========================================
# Stage 1: Build Frontend
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# ==========================================
# Stage 2: Production
# ==========================================
FROM node:20-alpine AS runner

RUN apk add --no-cache nginx gettext

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY db.json ./

# Copy static assets đã build từ Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy toàn bộ thư mục src/assets để phục vụ các ảnh được dẫn trực tiếp từ db.json và component
COPY src/assets /usr/share/nginx/html/src/assets

COPY nginx.conf /etc/nginx/nginx.conf.template

COPY start.sh /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 10000

CMD ["/app/start.sh"]