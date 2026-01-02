#!/bin/sh
set -e

echo "Starting container..."

if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Installing dependencies..."
  npm install
  echo "Generating prisma client..."
  npx prisma generate
else
  echo "Dependencies already installed"
fi

echo "Migrating database: $@"
npx prisma migrate dev --name init
echo "Starting application: $@"
exec "$@"