ARG NODE_VERSION=24.11.1

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /app

FROM base as deps
COPY package.json ./
RUN npm install
################################################################################
# Build the application
FROM deps as build
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
RUN npm run build

################################################################################
# Production image
FROM base AS final
ENV NODE_ENV=production

# Install Doppler CLI as root
RUN apk add --no-cache curl gnupg \
    && curl -Ls https://cli.doppler.com/install.sh | sh


COPY prisma ./prisma
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm run prisma:generate
COPY --from=build /app/dist ./dist
USER node

EXPOSE 4001
CMD ["doppler", "run", "--project", "deliveroo-auth-service", "--config", "dev", "--", "node", "dist/server.js"]
