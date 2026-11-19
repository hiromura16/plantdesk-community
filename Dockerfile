FROM node:24-bookworm-slim AS build
WORKDIR /app
ENV SCARF_ANALYTICS=false
COPY package*.json ./
COPY frontend/package*.json frontend/
RUN --mount=type=secret,id=npm_ca \
    if [ -f /run/secrets/npm_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/npm_ca; fi; \
    npm ci && npm ci --prefix frontend
COPY . .
RUN npm run build

FROM node:24-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=18018 PLANTDESK_DATA_DIR=/data
WORKDIR /app
COPY --from=build --chown=node:node /app/server ./server
COPY --from=build --chown=node:node /app/cloudflare ./cloudflare
COPY --from=build --chown=node:node /app/shared ./shared
COPY --from=build --chown=node:node /app/connectors ./connectors
COPY --from=build --chown=node:node /app/scripts/lib ./scripts/lib
COPY --from=build --chown=node:node /app/public ./public
RUN mkdir /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 18018
CMD ["node", "server/main.mjs"]
