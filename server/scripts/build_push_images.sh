#!/bin/bash

version="2.0.0"
repo="git.rezel.net/ludotech"
services=("proxy:traque-proxy" "traque-front:traque-front" "traque-back:traque-back")

for service in "${services[@]}"; do
    path="${service%%:*}"
    name="${service##*:}"
    tag_latest="${repo}/${name}:latest"
    tag_version="${repo}/${name}:${version}"

    echo "--- Building & Pushing $name ---"
    docker build -t "$tag_latest" -t "$tag_version" "$path"
    docker push "$tag_latest"
    docker push "$tag_version"
done
