#!/bin/sh
# Docker entrypoint script for the authentication service
# This script handles runtime configuration and starts the application

set -eu

# Validate required runtime environment variables
NODE_ENV="${NODE_ENV:-development}"
DOPPLER_TOKEN="${DOPPLER_TOKEN:-}"
DATABASE_URL="${DATABASE_URL:-}"

# Check that at least one secret source is provided
if [ -z "$DOPPLER_TOKEN" ] && [ -z "$DATABASE_URL" ]; then
    echo "ERROR: Either DOPPLER_TOKEN or DATABASE_URL must be set at runtime"
    echo ""
    echo "Option 1 - Using Doppler (recommended for production):"
    echo "  docker run -e DOPPLER_TOKEN=<token> -e DOPPLER_CONFIG=prd ..."
    echo ""
    echo "Option 2 - Using DATABASE_URL directly (for development/testing):"
    echo "  docker run -e DATABASE_URL=<connection_string> ..."
    echo ""
    exit 1
fi

# Validate other required environment variables
if [ -z "${SERVICE_NAME:-}" ]; then
    echo "WARNING: SERVICE_NAME not set. Using default: auth-service"
    SERVICE_NAME="auth-service"
fi

if [ -z "${PORT:-}" ]; then
    echo "WARNING: PORT not set. Using default: 3000"
    PORT="3000"
fi

# Determine how to start the application
if [ -n "$DOPPLER_TOKEN" ]; then
    echo "Starting application with Doppler (environment: $NODE_ENV)..."
    echo "Service: $SERVICE_NAME, Port: $PORT"
    
    # Run migrations with Doppler
    echo "Running database migrations..."
    doppler run -p "$SERVICE_NAME" -c "$NODE_ENV" -- npm run prisma:migrate:$NODE_ENV || true
    
    # Start application with Doppler
    exec doppler run -p "$SERVICE_NAME" -c "$NODE_ENV" -- npm run start:$NODE_ENV
else
    echo "Starting application with DATABASE_URL (environment: $NODE_ENV)..."
    echo "Service: $SERVICE_NAME, Port: $PORT"
    
    # Run migrations with DATABASE_URL
    echo "Running database migrations..."
    npm run prisma:migrate:$NODE_ENV || true
    
    # Start application with DATABASE_URL from environment
    exec npm run start:$NODE_ENV
fi
