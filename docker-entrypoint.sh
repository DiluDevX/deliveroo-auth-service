#!/bin/sh
# Docker entrypoint script for the authentication service
# This script handles runtime configuration and starts the application

set -eu

# Validate required runtime environment variables
if [ -z "${DOPPLER_TOKEN:-}" ]; then
    echo "ERROR: DOPPLER_TOKEN must be set at runtime"
    echo "Provide it via: docker run -e DOPPLER_TOKEN=<token> ..."
    exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL must be set at runtime"
    echo "Provide it via: docker run -e DATABASE_URL=<url> ..."
    exit 1
fi

# Run database migrations based on environment
echo "Running database migrations for ${NODE_ENV:-development} environment..."
npm run prisma:migrate:${NODE_ENV:-development}

# Start the application
echo "Starting application..."
exec npm run start:${NODE_ENV:-development}
