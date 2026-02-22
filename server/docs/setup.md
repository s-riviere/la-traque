---
lang: en-GB
---

# Set up server

This tutorial will help you to start the servers for development or for production.

## Table of Contents
* [Docker](#docker) : Explaination and commands
* [Start server](#start-server) : Development and deployment

## Docker

The server and the website use Docker. When the containers are up, you can access the website by searching for localhost on the web.

Useful docker commands :

- Create the containers : `docker compose -f {your-file.yaml} up`
- Remove the containers : `docker compose down`
- Add the `-d` flag to create the containers in the background
- Stop the running containers : `docker compose stop`
- Start the stopped containers : `docker compose start`
- See all containers : `docker ps -a`
- See all images : `docker images`
- Remove an image : `docker rmi IMAGE_ID`

## Start server

### Development

Use `docker compose -f docker-compose.dev.yaml up` to start the containers of the server in development mode so the changes made in the project take effect immediately. You can access the website by searching for `localhost` in your browser.

### Deployment

#### Access the LXC container

The server run on a rezel LXC container you can access [here](https://hosting.rezel.net/vms). Ask persmissions to an admin of the container to be able to connect to it via ssh : `ssh admin@2a09:6847:fa10:1410::207`.

#### Update images

If it isn't the case, you have to login to the docker of git.rezel.net. To do that, go on `git.rezel.net` and create an access token for your account allowing writing package, repository and user, and save the token password. Then on your machine run `docker login git.rezel.net` and connect with your token password. Now, you can build and push the latest images on the remote by running `./scripts/build_push_images.sh`. Then connect to the LXC container, go in the `traque/` folder and run `docker compose pull` to pull the images.

#### Start the server

Access the LCX container, go in the `traque/` folder and run `docker compose up -d` to start the containers. The website will be accesible on `traque.rezel.net`.
