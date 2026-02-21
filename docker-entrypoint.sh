#!/bin/sh
set -eu

: "${DOPPLER_TOKEN:?DOPPLER_TOKEN must be set in the container environment}"

npm run prisma:migrate:${NODE_ENV}
exec npm start:${NODE_ENV}
