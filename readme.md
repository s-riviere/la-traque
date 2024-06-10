# Instructions
## Setup development environment
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
Put your certificate and private key in the proxy/ssl folder. They need to be named `cert.pem` and `privkey.pem`.
You can then depploy the docker application with `docker compose up`
You can change the production environment varialbes for the backend in the docker-compose.yml file. The frontend environment variables can be changed in the .env file in the traque-front directory.
The reverse proxy is used to get https to the next app on port 3000.