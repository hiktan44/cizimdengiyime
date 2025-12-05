# Frontend Dockerfile (Vite/React)

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Package files'ı kopyala
COPY package*.json ./

# Dependencies'leri yükle
RUN npm ci

# Uygulama kodunu kopyala
COPY . .

# Build arguments (Environment variables)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GOOGLE_AI_API_KEY
ARG VITE_PAYTR_MERCHANT_ID
ARG VITE_PAYTR_MERCHANT_KEY
ARG VITE_PAYTR_MERCHANT_SALT
ARG VITE_BACKEND_API_URL

# Environment variables'ı set et
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_GOOGLE_AI_API_KEY=$VITE_GOOGLE_AI_API_KEY
ENV VITE_PAYTR_MERCHANT_ID=$VITE_PAYTR_MERCHANT_ID
ENV VITE_PAYTR_MERCHANT_KEY=$VITE_PAYTR_MERCHANT_KEY
ENV VITE_PAYTR_MERCHANT_SALT=$VITE_PAYTR_MERCHANT_SALT
ENV VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL

# Build et
RUN npm run build

# Production stage
FROM nginx:alpine

# Nginx config'i kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build dosyalarını nginx'e kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# Port expose et
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]
