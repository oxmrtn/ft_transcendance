#!/bin/sh
set -e

echo "Starting container..."

if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Installing dependencies..."
  if [ "$NODE_ENV" = "production" ]; then
    npm install --include=dev
  else
    npm install
  fi
else
  echo "Dependencies already installed"
fi

if [ "$NODE_ENV" = "production" ]; then
  if [ ! -d "node_modules/@tailwindcss/postcss" ]; then
    echo "Tailwind PostCSS plugin not found, installing build dependencies..."
    npm install --include=dev
  fi

  echo "Building application..."
  npm run build

  echo "Starting application in production..."
  exec npm run start
else
  echo "Starting application in development..."
  exec npm run dev
fi