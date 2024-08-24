#!/bin/bash

# Check if VERSION is passed as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <VERSION>"
  exit 1
fi

VERSION=$1

# Store the name of the current builder
ORIGINAL_BUILDER=$(docker buildx use | awk '{print $NF}')

# Update the LABEL version in the Dockerfile
sed -i.bak -E "s/(LABEL version=\")[^\"]+(\")/\1${VERSION}\2/" Dockerfile

# Check if the builder exists, create it if it doesn't
if ! docker buildx inspect playoffs-mov-builder > /dev/null 2>&1; then
  echo "Creating new builder: playoffs-mov-builder"
  docker buildx create --name playoffs-mov-builder
fi

# Use the playoffs-mov-builder
docker buildx use playoffs-mov-builder

# Build and push the multi-platform docker image
docker buildx build --platform linux/amd64,linux/arm64 \
  -t ghcr.io/nachoaivarez/playoffs.mov:${VERSION} \
  -t ghcr.io/nachoaivarez/playoffs.mov:latest \
  --push .

if [ $? -ne 0 ]; then
  echo "Docker build failed"
  exit 1
fi

# Commit and push the LABEL change to git
git add Dockerfile
git commit -m "${VERSION}"
git tag "${VERSION}"
git push origin master --tags

echo "Multi-architecture Docker image successfully built, tagged, and pushed."

# Switch back to the original builder
docker buildx use "$ORIGINAL_BUILDER"
echo "Switched back to the original builder: $ORIGINAL_BUILDER"