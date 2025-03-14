#/bin/bash

version="0.3.2"
repository="git.rezel.net/ludotech"

docker build  -t ${repository}/traque-proxy:latest -t ${repository}/traque-proxy:${version} proxy
docker build -t ${repository}/traque-front:latest -t ${repository}/traque-front:${version} traque-front
docker build -t ${repository}/traque-back:latest -t ${repository}/traque-back:${version} traque-back

docker push ${repository}/traque-proxy:latest 
docker push ${repository}/traque-proxy:${version}
docker push ${repository}/traque-front:latest 
docker push ${repository}/traque-front:${version}
docker push ${repository}/traque-back:latest 
docker push ${repository}/traque-back:${version}

