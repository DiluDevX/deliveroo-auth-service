ARG NODE_VERSION=24.11.1

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /app
RUN corepack enable && corepack prepare yarn@stable --activate

FROM base as deps
COPY package.json yarn.lock ./
RUN npm install
################################################################################
# Build the application
FROM deps as build
COPY .yarn ./.yarn
COPY .yarnrc.yml ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm run prisma:generate
RUN npm run build

################################################################################
# Production image
FROM base AS final
ENV NODE_ENV=production

# Install Doppler CLI as root
RUN apk add --no-cache curl gnupg \
    && curl -Ls https://cli.doppler.com/install.sh | sh

USER node

COPY prisma ./prisma
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 4001
CMD ["doppler", "run", "--project", "deliveroo-auth-service", "--config", "dev", "--", "node", "dist/server.js"]
