FROM node:20.9.0-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and file
COPY ./package.json ./

# Install dependencies
RUN npm i --production

COPY . .

ENV NODE_ENV production

EXPOSE 5000

# Start the server
CMD ["npm","run","start"]