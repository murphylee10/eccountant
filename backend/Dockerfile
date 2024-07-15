# Dockerfile adapted from
# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Copy the common directory
COPY ../common ./common

# Copy the backend directory to /usr/src/app/backend
COPY . ./backend

# Change the working directory to /usr/src/app/backend
WORKDIR /usr/src/app/backend

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose necessary ports
EXPOSE 3000
EXPOSE 8001

# Default command is to start the application
CMD ["npx", "concurrently", "\"node dist/app.js\"", "\"node dist/webhookServer.js\""]


# CMD ["npx", "concurrently", "\"node dist/app.js\"", "\"node dist/webhookServer.js\""]
