# Use the official Node.js runtime as the base image
FROM node:18

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# This command will run when the container starts
CMD ["npm", "run", "sandbox"]
