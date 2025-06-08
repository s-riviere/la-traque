# Use Node 20 alpine as parent image
FROM node:22-alpine

# Change the working directory on the Docker image to /app
WORKDIR /app

# Copy package.json and package-lock.json to the /app directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of project files into this image
COPY . .

RUN if [ ! -d uploads ]; then mkdir uploads; fi

RUN if [ ! -d trajectories ]; then mkdir trajectories; fi

EXPOSE 3001

# Start the application
CMD npm start
