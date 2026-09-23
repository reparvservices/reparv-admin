# =========================
# 1. Dependencies
# =========================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


# =========================
# 2. Build
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Vite inlines import.meta.env.VITE_* at build time, so these must be
# supplied as build args -- setting them at runtime has no effect.
ARG VITE_API_BASE_URL
ARG VITE_S3_IMAGE_URL
ARG VITE_ASSET_BASE_URL
ARG VITE_GOOGLE_MAPS_API_KEY

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_S3_IMAGE_URL=$VITE_S3_IMAGE_URL
ENV VITE_ASSET_BASE_URL=$VITE_ASSET_BASE_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build


# =========================
# 3. Production
# =========================
FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
