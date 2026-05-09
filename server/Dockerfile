FROM node:22-alpine

WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server ./

ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]
