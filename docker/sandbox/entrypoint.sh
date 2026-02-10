#!/bin/sh

echo building tester image...

dockerd-entrypoint.sh &
while ! docker info > /dev/null 2>&1; do
    echo "Attente du démarrage du démon Docker..."
    sleep 1
done

echo "Installing nest modules..."

if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Installing dependencies..."
  npm install
else
  echo "Dependencies already installed"
fi

echo "Building template tester image: $@"
docker build -t testerdocker .

echo "Starting application: $@"
exec "$@"