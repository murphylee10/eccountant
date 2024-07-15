# Build the Angular App
# This compiles the Angular project to static HTML and js files.
FROM node:20-alpine as build

# Set the working directory to /app/web for the Angular app
WORKDIR /app/web
ENV PATH /app/web/node_modules/.bin:$PATH

# Copy package files from the web directory
COPY web/package.json ./
COPY web/package-lock.json ./

# Install dependencies
RUN npm ci --silent

# Copy the web source files into /app/web
COPY web/ ./

# Copy the common directory into /app/common
COPY common ../common

# Build the Angular app
RUN npm run build

# Serve the static files with NGINX
FROM nginx:1.21.6-alpine
COPY --from=build /app/web/dist/web /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
