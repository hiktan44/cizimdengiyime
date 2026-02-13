# Backend Dockerfile (Node.js Express API)

FROM node:20-alpine

# Çalışma dizinini oluştur
WORKDIR /app

# Package files'ı kopyala
COPY package*.json ./

# Dependencies'leri yükle
RUN npm ci --only=production

# Uygulama kodunu kopyala
COPY . .

# Port expose et
EXPOSE 3001

# Health check ekle
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Uygulamayı başlat
CMD ["npm", "start"]
