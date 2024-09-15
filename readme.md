---
lang: en-GB
---

# The game
## General principle
La traque is a IRL team game where the goal is to catch another team without being catched by another team.
Each team starts with the starting position of the tracked team as well as a picture of them, they don't know who they are being tracked by.
To get the latest known position of the tracked team, a team can update their lastest known position as their own position.
Once the tracked team is captured, the tracked team becomes the team previously tracked by the captured team, the game continues until two teams are left.
Each team has to update their location at a given interval, if they don't, they recieve a penalty.
The game is played in a zone, if a team goes outside of the zone for a given time, they recieve a penalty.
For further information see the pdf in the doc folder.

## The zone
The zone is similar to the one in Fortnite, it is a circle that gets smaller and smaller as the game goes on.
The zone is defined by two circles, the starting zone and the final zone, a number of reductions, the delay between two reductions, and the duration of a reduction.

## The penalties
A penalty can be given to a team for going outside the zone or not updating their position. After 3 penalties a team is eliminated.

# Structure of the app
The app is divided in two parts, a Next.js front end and a Node.js back end.
The front end is divided in a team section and an admin section.
The backend manages the game state and the teams, and communicates with the front end through socket.io

# Setting up the app
## Development environment
### Front end configuration
Edit the .env file in traque-front and add specify the following values:
```
NEXT_PUBLIC_SOCKET_HOST = 'example.com'
NEXT_PUBLIC_SOCKET_PORT = 3001
```
Where NEXT_PUBLIC_SOCKET_HOST is the host of the socket server and NEXT_PUBLIC_SOCKET_PORT is the port of the socket server.
### Back end configuration
Edit the .env file in traque-back and add specify the following values:
```
HOST = 'example.com'
PORT = 3001
SSL_KEY = "/path/to/privkey.pem"
SSL_CERT = "/path/to/cert.pem"
ADMIN_PASSWORD = 'admin_password_here'
```

Where ADMIN_PASSWORD is the password for the admin user, HOST is the host of the server, PORT is the port of the server, SSL_KEY is the path to the key file and SSL_CERT is the path to the certificate file. 
The SSL_KEY and SSL_CERT are used for HTTPS and are required for the server to work. This is because the browser will block the GeoLocation API if the connection is not secure.

Note : make sure PORT and NEXT_PUBLIC_SOCKET_PORT are the same

### Running the project
#### Front end
To run the front end, navigate to the traque-front directory and run the following commands:
```
npm install
npm run dev
```
#### Back end
To run the back end, navigate to the traque-back directory and run the following commands:
```
npm install
npm start
```
Then navigate to the host and port specified in the .env file to access the application.
```
https://example.com:3000
```

## Deployment
Put your certificate and private key in the `proxy/ssl` folder. They need to be named `cert.pem` and `privkey.pem`.
You can then deploy the docker application with `docker compose up`.

You can change the production environment variables for the backend in the `docker-compose.yml` file. The frontend environment variables can be changed in the `.env` file in the `traque-front` directory.

# Authors
- [Quentin Roussel](mailto:quentin.roussel11@gmail.com) (initial version)