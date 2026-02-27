# Docker Build and Deployment Guide

This guide explains how to securely build and run the authentication service Docker image.

## Security Overview

This application uses **Docker BuildKit secrets** to prevent sensitive credentials from being exposed in image layers. Secrets are:

- Only mounted during the build process
- Not stored in image history
- Not visible via `docker history` or image inspection
- Automatically removed after build completes

## Prerequisites

- Docker with BuildKit support (Docker 18.09+)
- Enable BuildKit: `export DOCKER_BUILDKIT=1`
- Required secrets:
  - `DOPPLER_TOKEN`: For accessing Doppler configuration
  - `DATABASE_URL`: PostgreSQL connection string

## Building the Image

### Option 1: Using Docker BuildKit Secrets (Recommended)

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Build with secrets passed securely
docker build \
  --secret doppler_token=$DOPPLER_TOKEN \
  --secret database_url=$DATABASE_URL \
  -t auth-service:latest \
  .
```

### Option 2: Using a Secrets File

```bash
# Create a secrets file (do not commit to git)
echo "$DOPPLER_TOKEN" > /tmp/doppler_token
echo "$DATABASE_URL" > /tmp/database_url

# Build with secrets from files
docker build \
  --secret doppler_token=/tmp/doppler_token \
  --secret database_url=/tmp/database_url \
  -t auth-service:latest \
  .

# Clean up temporary files
rm /tmp/doppler_token /tmp/database_url
```

## Running the Container

### Environment Variables Required at Runtime

The following variables must be provided when running the container:

- `DOPPLER_TOKEN`: For accessing secrets via Doppler
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (development, production, test) - defaults to development
- `PORT`: Server port - defaults to 3000

### Running with Docker Run

```bash
docker run \
  -e DOPPLER_TOKEN=$DOPPLER_TOKEN \
  -e DATABASE_URL=$DATABASE_URL \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -p 3000:80 \
  auth-service:latest
```

### Running with Docker Compose

```yaml
version: '3.8'

services:
  auth-service:
    image: auth-service:latest
    environment:
      DOPPLER_TOKEN: ${DOPPLER_TOKEN}
      DATABASE_URL: ${DATABASE_URL}
      NODE_ENV: production
      PORT: 3000
    ports:
      - '3000:80'
    # Use secrets from Docker Secrets (Swarm mode)
    # Or from .env file (Compose file format 3.8+)
    env_file:
      - .env.production
```

## Security Best Practices

### ✅ DO

- Store `DOPPLER_TOKEN` and `DATABASE_URL` in:
  - Docker Secrets (Swarm mode)
  - GitHub Actions Secrets
  - AWS Secrets Manager
  - Environment variables in secure deployment platforms
- Use BuildKit secrets during build
- Never commit `.env` files with production secrets
- Rotate tokens regularly
- Use separate credentials per environment

### ❌ DON'T

- Embed credentials in ARG or ENV during build
- Pass secrets via command line without BuildKit
- Commit `.env` files to git
- Use default/example credentials in production
- Share Docker images with embedded secrets
- Use `docker history` on images with sensitive data

## Verifying Secrets Are Not in Image

After building, verify that secrets are not exposed in image layers:

```bash
# This should NOT contain DOPPLER_TOKEN or DATABASE_URL
docker history auth-service:latest

# Inspect the image config
docker inspect auth-service:latest | grep -i doppler
docker inspect auth-service:latest | grep -i database
# Both should return empty

# Build args are also safe (not in final image)
docker inspect auth-service:latest | grep -i app_version
```

## Troubleshooting

### BuildKit Not Enabled

```bash
# Error: "--secret flag requires BuildKit"
export DOCKER_BUILDKIT=1
docker build --secret doppler_token=... .
```

### Missing Secrets During Build

```bash
# Error: "DOPPLER_TOKEN must be set"
# Solution: Ensure secrets are passed to docker build command:
docker build --secret doppler_token=$DOPPLER_TOKEN --secret database_url=$DATABASE_URL .
```

### Missing Runtime Environment Variables

```bash
# Error: "DOPPLER_TOKEN must be set at runtime"
# Solution: Pass environment variables to docker run:
docker run -e DOPPLER_TOKEN=$DOPPLER_TOKEN -e DATABASE_URL=$DATABASE_URL ...
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: my-registry/auth-service:latest
          secrets: |
            doppler_token=${{ secrets.DOPPLER_TOKEN }}
            database_url=${{ secrets.DATABASE_URL }}
```

## Image Size and Performance

BuildKit secrets have zero impact on:

- Final image size
- Runtime performance
- Build time (typically improves slightly)

Secrets mounted during build are automatically unmounted and not included in the final image.

## Additional Resources

- [Docker BuildKit Documentation](https://docs.docker.com/build/buildkit/)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)
- [Doppler Documentation](https://docs.doppler.com/)
