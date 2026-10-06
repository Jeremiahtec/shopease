# Builds the React app and serves it with Caddy (automatic HTTPS, SPA fallback, /api reverse proxy).
# Build context is the PARENT folder, see docker-compose.yml.
FROM node:22-alpine AS build
WORKDIR /app
COPY shopease-frontend/package.json shopease-frontend/package-lock.json ./
RUN npm ci
COPY shopease-frontend/ ./
ARG VITE_COMPANY_NAME=ShopEase
ARG VITE_SUPPORT_EMAIL=support@your-domain.com
ARG VITE_COMPANY_ADDRESS=
ARG VITE_LEGAL_REVIEWED=false
ENV VITE_COMPANY_NAME=$VITE_COMPANY_NAME VITE_SUPPORT_EMAIL=$VITE_SUPPORT_EMAIL VITE_COMPANY_ADDRESS=$VITE_COMPANY_ADDRESS VITE_LEGAL_REVIEWED=$VITE_LEGAL_REVIEWED
RUN npm run build

FROM caddy:2-alpine
COPY shopease-deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
