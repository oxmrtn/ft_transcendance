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
  echo "Generating prisma client..."
  npx prisma generate
else
  echo "Dependencies already installed"
fi

if [ "$NODE_ENV" = "production" ]; then
  if [ ! -x "node_modules/.bin/nest" ]; then
    echo "Nest CLI not found, installing build dependencies..."
    npm install --include=dev
  fi

  echo "Applying production migrations..."
  npx prisma migrate deploy

  echo "Building application..."
  npm run build

  echo "Starting application in production..."
  exec npm run start
else
  echo "Migrating database..."
  npx prisma migrate dev --name init

  echo "Seeding database..."
  npx prisma db seed

  echo "Starting application in development..."
  exec npm run dev
fi