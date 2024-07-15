# Dockerfile adapted from
# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Copy the common directory
COPY common ./common

# Change the working directory to /usr/src/app/backend
WORKDIR /usr/src/app/backend

# Install app dependencies
# Copy package files from backend directory
COPY backend/prisma ./prisma

COPY backend/package*.json ./

RUN npm install

# Bundle app source
COPY backend/ ./

# Expose necessary ports
EXPOSE 3000
EXPOSE 8001