FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code and default env
COPY src/ ./src/
COPY .env.example ./.env

EXPOSE 5000

CMD ["node", "src/server.js"]
