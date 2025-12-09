#!/bin/sh
set -e

echo "Starting container..."

# Install dependencies if node_modules is missing or empty
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Installing dependencies..."
  npm install
else
  echo "Dependencies already installed"
fi

echo "Starting application: $@"
exec "$@"