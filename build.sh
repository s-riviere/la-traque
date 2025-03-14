#/bin/bash

version="0.2"
repository="git.rezel.net/ludotech"

docker build -t ${repository}/traque-proxy:${version} proxy
docker build -t ${repository}/traque-front:${version} traque-front
docker build -t ${repository}/traque-back:${version} traque-back

docker push ${repository}/traque-proxy:${version}
docker push ${repository}/traque-front:${version}
docker push ${repository}/traque-back:${version}
