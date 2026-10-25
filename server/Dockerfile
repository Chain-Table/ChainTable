FROM node:22-alpine

WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server ./
# El motor del truco vive fuera de server/; server.js lo carga con require('../truco/engine')
COPY truco/engine /app/truco/engine

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

# Sin root: si alguien rompe el proceso, no es root del contenedor
USER node

CMD ["node", "server.js"]
