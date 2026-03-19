#!/bin/sh
set -e

echo building tester image...

dockerd-entrypoint.sh &
while ! docker info > /dev/null 2>&1; do
    echo "Attente du démarrage du démon Docker..."
    sleep 1
done

echo "Installing nest modules..."

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

echo "Building template tester image: $@"
docker build -t testerdocker .

if [ "$NODE_ENV" = "production" ]; then
  if [ ! -x "node_modules/.bin/nest" ]; then
    echo "Nest CLI not found, installing build dependencies..."
    npm install --include=dev
  fi

  echo "Building sandbox application..."
  npm run build

  echo "Starting sandbox in production..."
  exec npm run start
else
  echo "Starting sandbox in development..."
  exec npm run dev
fi