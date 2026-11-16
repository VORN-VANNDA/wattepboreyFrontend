FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_API_URL=/api
ENV VITE_UPLOAD_ORIGIN=https://wattepborey.com
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=build /app/dist /usr/share/nginx/html
COPY package.json ./package.json
COPY worker.js ./worker.js
COPY src/lib/publicLinks.js ./src/lib/publicLinks.js
COPY deploy-server.mjs ./deploy-server.mjs
ENV PORT=3000
EXPOSE 3000
CMD ["node", "deploy-server.mjs"]
