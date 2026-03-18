#!/bin/sh
set -e

echo "Starting container..."

if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Installing dependencies..."
  npm install
else
  echo "Dependencies already installed"
fi

if [ "$NODE_ENV" = "production" ]; then
  echo "Building application..."
  npm run build

  echo "Starting application in production..."
  exec npm run start
else
  echo "Starting application in development..."
  exec npm run dev
fi