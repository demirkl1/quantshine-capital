# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci --silent

# Vite build-time env (import.meta.env.VITE_*). Yalnızca API base path gerekli;
# keycloak değişkenleri Faz 1 cookie-BFF göçünde kaldırıldı.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV NODE_OPTIONS=--max-old-space-size=1536

COPY tsconfig.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src

# Vite inline <script> üretmez (modulePreload.polyfill=false) → CSP 'self' yeterli.
RUN npm run build

# =============================================================================
# Stage 2: Serve
# =============================================================================
FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
