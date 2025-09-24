---
lang: en-GB
---

# La Traque

La Traque is an outdoor survival game where several teams, usually made up of three players, compete in a shrinking play zone until only two remain. Each team starts in a different location within the play zone. Once the game begins, each team must track and capture their target while being hunted by another team. Teams can obtain information about their target's location in exchange for revealing information about their own position. See the documentation for the complete explaination.

The next sections will help you to set up your environment in order to develop on the project or deploy it.

## Development

This section will cover how to set up the server, the website and the app in development mode so the changes made in the project take effect immediately.

### Server and website

The server and the website use Docker. When the containers are up, you can access the website by searching for localhost on the web.

Main commands :

- Create the containers : `docker compose -f docker-compose.dev.yaml up`
- Remove the containers : `docker compose down`

Other commands :

- Add the `-d` flag to create the containers in the background
- Stop the running containers : `docker compose stop`
- Start the stopped containers : `docker compose start`
- See all containers : `docker ps -a`
- See all images : `docker images`
- Remove an image : `docker rmi IMAGE_ID`

### Android app

- Follow the `traque-app/doc/dev_build_android.md` tutorial to set up your environment and start the development server.

## Deployment

This section will cover how to deploy the server and the website on a rezel virtual machine, and how to create an apk of the Android app.

### Server and website

- On git.rezel.net create an access token for your account allowing in writing package, repository and user. Save the token password.
- On your machine run `docker login git.rezel.net` and connect with your token password.
- On your machine run `./build_push_images.sh` to build and push the latest images on the remote.
- Connect to the local network of Telecom Paris, then connect to the virtual machine by running `ssh admin@137.194.13.69`. Make sure your ssh key is in the `.ssh/authorized_keys` file of the virtual machine.
- Finally create the containers by running `docker compose -f docker-compose.dev.yaml up -d`

### Android app

- Follow the `traque-app/doc/apk_android.md` tutorial to create an apk of the Android app.

## Authors

- [Quentin Roussel](mailto:quentin.roussel11@gmail.com) (initial version)
- Mathieu Oriol
- [Sébastien Rivière](mailto:sebriviere2004@gmail.com)
