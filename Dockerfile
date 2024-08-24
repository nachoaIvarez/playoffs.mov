# Use an official Node runtime as the base image
FROM node:20.17.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["yarn", "start"]

# Add a LABEL for the version
LABEL version="1.1.0"