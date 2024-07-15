# Build the Angular App
# This compiles the Angular project to static HTML and js files.
FROM node:20-alpine as build

# Set the working directory to /app
WORKDIR /app

# Copy the common directory
COPY ../common ./common

# Copy the web directory to /app/web
COPY . ./web

# Change the working directory to /app/web
WORKDIR /app/web
ENV PATH /app/web/node_modules/.bin:$PATH

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm ci --silent

# Build the Angular app
RUN npm run build

# Serve the static files with NGINX
FROM nginx:1.21.6-alpine
COPY --from=build /app/web/dist/web /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
