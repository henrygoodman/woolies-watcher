#!/bin/bash

set -e

# Enable Docker BuildKit for improved build performance
export DOCKER_BUILDKIT=1

# Build the Docker Compose stack
echo "Building the Docker Compose stack..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start the services
echo "Starting the Docker Compose stack in detached mode..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Clean up dangling images to save space
echo "Cleaning up dangling images..."
docker image prune -f

echo "Deployment completed successfully!"
