FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY BackEnd/package.json ./BackEnd/package.json
COPY FrontEnd/package.json ./FrontEnd/package.json

RUN npm ci --workspace=FrontEnd

COPY FrontEnd ./FrontEnd
RUN npm run build --workspace=FrontEnd

FROM nginx:1.27-alpine

ENV VITE_API_URL=http://localhost:8080/api/v1
ENV VITE_SOCKET_URL=http://localhost:8080
ENV VITE_PAYPAL_CLIENT_ID=
ENV VITE_PAYPAL_CURRENCY=USD

COPY FrontEnd/nginx.conf /etc/nginx/conf.d/default.conf
COPY FrontEnd/docker-entrypoint.d/40-env-config.sh /docker-entrypoint.d/40-env-config.sh
RUN sed -i 's/\r$//' /docker-entrypoint.d/40-env-config.sh
COPY FrontEnd/public/env-config.template.js /usr/share/nginx/html/env-config.template.js
COPY --from=builder /app/FrontEnd/dist /usr/share/nginx/html

RUN chmod +x /docker-entrypoint.d/40-env-config.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/healthz || exit 1
