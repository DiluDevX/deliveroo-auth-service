# syntax=docker/dockerfile:1.7
FROM node:24.11.1-alpine

# environment
ARG ENV=development

ENV NODE_ENV=$ENV

# Working directory
WORKDIR /usr/app

# Copy all files
COPY . .

# Install doppler CLI for secrets management
RUN apk add --no-cache curl gnupg \
    && curl -Ls https://cli.doppler.com/install.sh | sh

# Generate Prisma Client
RUN --mount=type=secret,id=doppler_token \
    DOPPLER_TOKEN="$(cat /run/secrets/doppler_token)" npm run prisma:generate

# Set the user
USER node

# Expose the port the app runs on
EXPOSE 80

# Run migrations and start the application
CMD ["./docker-entrypoint.sh"]
