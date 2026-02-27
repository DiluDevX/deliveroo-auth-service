# syntax=docker/dockerfile:1.7
FROM node:24.11.1-alpine AS builder

ARG ENV=development
ENV NODE_ENV=$ENV
ARG APP_VERSION=0.0.0-dev
ENV APP_VERSION=$APP_VERSION

WORKDIR /usr/app

RUN apk add --no-cache curl gnupg \
    && curl -Ls https://cli.doppler.com/install.sh | sh

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma

# Use BuildKit secrets for sensitive data during build
# Secrets are not stored in image layers and are only mounted at build time
# Usage: docker build --secret doppler_token=<token> --secret database_url=<url> ...
RUN --mount=type=secret,id=doppler_token \
    --mount=type=secret,id=database_url \
    sh -c 'export DOPPLER_TOKEN=$(cat /run/secrets/doppler_token) && \
           export DATABASE_URL=$(cat /run/secrets/database_url) && \
           doppler run -- npx prisma generate'

COPY . .

RUN --mount=type=secret,id=doppler_token \
    sh -c 'export DOPPLER_TOKEN=$(cat /run/secrets/doppler_token) && \
           doppler run -- npm run build'

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
