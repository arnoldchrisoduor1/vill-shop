#!/bin/sh
set -e

echo "Running database migrations..."
node dist/database/data-source.js run

echo "Starting API..."
exec node dist/main
