---
lang: en-GB
---

# The game
### General principle
La traque is an IRL team game where the goal is to catch another team without being caught by another team.
Each team starts with the starting position of the tracked team as well as a picture of them, they don't know who they are being tracked by.
To get the latest known position of the tracked team, a team can update their latest known position as their own position.
Once the tracked team is captured, the tracked team becomes the team previously tracked by the captured team, the game continues until two teams are left.
Each team has to update their location at a given interval, if they don't, they receive a penalty.
The game is played in a zone, if a team goes outside the zone for a given time, they receive a penalty.
For further information see the pdf in the doc folder.

### The zone
The zone is similar to the one in Fortnite, it is a circle that gets smaller and smaller as the game goes on.
The zone is defined by two circles, the starting zone and the final zone, a number of reductions, the delay between two reductions, and the duration of a reduction.

### The penalties
A penalty can be given to a team for going outside the zone or not updating their position. After 3 penalties a team is eliminated.

# Structure of the app
The app is divided in three parts, a Next.js front end, a Node.js back end and a reverse proxy.
- The front end is divided in a team section and an admin section.
- The backend manages the game state and the teams, and communicates with the front end through `socket.io`.
- You need a reverse proxy to redirect requests to the right service (frontend or backend). Requests with URL starting with `/back/` are redirected to the backend (usually port 3001), all others to the front (usually port 3000).

# Setting up the app
## Configuration
You can edit the front and back environment in the docker-compose file you plan to use.
- The `docker-compose.yaml` and `Dockerfile` files are used for deployment.
- The `docker-compose.dev.yaml` and `Dockerfile.dev` files are used for development.

### Back
```
HOST : host of the server
PORT : port of the server
SSL_KEY : path to the key file
SSL_CERT : path to the certificate file
ADMIN_PASSWORD_HASH : hash of the password for the admin user
```

The SSL_KEY and SSL_CERT are used for HTTPS and are required for the server to work. This is because the browser will block the GeoLocation API if the connection is not secure.

### Front
```
NEXT_PUBLIC_SOCKET_HOST : host of the socket server
NEXT_PUBLIC_SOCKET_PORT : port of the socket server (has to be the same as the port of the server)
```

## Development
Run `docker compose -f docker-compose.dev.yaml up --build` to start the docker application in development mode. This means that each modification in the frontend or backend will be applied without the need to restart the server.

## Deployment
Run `docker compose up` to deploy the docker application.

# Authors
- [Quentin Roussel](mailto:quentin.roussel11@gmail.com) (initial version)
- Mathieu Oriol
- Sébastien Rivière
