# syntax=docker/dockerfile:1

FROM node:18.2-alpine3.15 AS base

WORKDIR /app
COPY package*.json ./

FROM base AS dev
ENV NODE_ENV=dev
RUN npm install
COPY . .
CMD ["npm", "run", "start:dev"]

FROM base AS prod
ENV NODE_ENV=prod
RUN npm install -g @nestjs/cli
RUN npm install --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]