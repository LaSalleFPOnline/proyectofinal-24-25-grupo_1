# Build the Angular app
FROM node:20.9.0-alpine AS build

# Place the code in the /app directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY ./package.json ./

# Run a clean install of dependencies
RUN npm i

# Install Angular CLI
RUN npm install g @angular/cli

# Copy the rest of the files
COPY . .

# Build the app
RUN npm run build --prod

# Serve the app with NGINX
FROM nginx:alpine

# Copy the build output to replace the nginx contents
# prueba-server comes from angular.json
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/prueba-server /usr/share/nginx/html