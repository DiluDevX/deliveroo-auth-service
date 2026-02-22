# syntax=docker/dockerfile:1.7
FROM node:24.11.1-alpine AS builder

ARG ENV=development
ENV NODE_ENV=$ENV
ARG APP_VERSION=0.0.0-dev
ENV APP_VERSION=$APP_VERSION
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ARG DOPPLER_TOKEN
ENV DOPPLER_TOKEN=$DOPPLER_TOKEN

WORKDIR /usr/app

RUN apk add --no-cache curl gnupg \
    && curl -Ls https://cli.doppler.com/install.sh | sh

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN doppler run -- npx prisma generate

COPY . .
RUN doppler run -- npm run build

FROM node:24.11.1-alpine

ARG ENV=development
ENV NODE_ENV=$ENV
ARG APP_VERSION=0.0.0-dev
ENV APP_VERSION=$APP_VERSION

WORKDIR /usr/app

LABEL org.opencontainers.image.version=$APP_VERSION

RUN apk add --no-cache gnupg

COPY --from=builder /usr/app/package.json ./package.json
COPY --from=builder /usr/app/package-lock.json ./package-lock.json
COPY --from=builder /usr/app/node_modules ./node_modules
COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/prisma ./prisma
COPY --from=builder /usr/local/bin/doppler /usr/local/bin/doppler
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh \
    && chown -R node:node /usr/app

USER node

EXPOSE 80

CMD ["./docker-entrypoint.sh"]
