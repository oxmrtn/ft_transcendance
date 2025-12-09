# Base image for development
FROM node:20-alpine

# Set working directory in the container
WORKDIR /app

# Copy package files first for better layer caching
COPY srcs/front/package.json ./

# Install dependencies in the image
RUN npm install

# Copy the entrypoint script to a location in the PATH
COPY docker/front/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set the entrypoint for the container
ENTRYPOINT ["entrypoint.sh"]

# Expose the port the app runs on
EXPOSE 3000

# Default command to run when the container starts
CMD ["npm", "run", "dev"]