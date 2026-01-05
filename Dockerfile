# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.12.0

################################################################################
# Base image with Node.js
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app

# Enable corepack for yarn
RUN corepack enable

################################################################################
# Install production dependencies
FROM base AS deps

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN --mount=type=cache,target=/root/.yarn \
    yarn workspaces focus --production

################################################################################
# Build the application
FROM base AS build

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN --mount=type=cache,target=/root/.yarn \
    yarn install --immutable

# Generate Prisma client
COPY prisma ./prisma
RUN yarn prisma:generate

# Copy source and build
COPY tsconfig.json ./
COPY src ./src

RUN yarn build

################################################################################
# Production image
FROM base AS final

ENV NODE_ENV=production

# Run as non-root user
USER node

# Copy built assets
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY package.json ./
COPY prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/server.js"]
