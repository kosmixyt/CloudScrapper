# Use the official Node.js image as the base image
FROM oven/bun:1

RUN apt update && apt install -y curl
RUN apt-get install xvfb -y

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the .env file temporarily
COPY .env .env

# Install dependencies and configure the environment
COPY . .
RUN bun install && bun install -g prisma && prisma db push --accept-data-loss --force-reset

# Remove the .env file after use

# install chrome
RUN apt install gnupg -y
RUN curl -sS -o - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add
RUN echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list
RUN apt-get -y update
RUN apt-get -y install google-chrome-stable
RUN apt install ffmpeg -y

# Expose the port the app runs on
EXPOSE 3000

RUN bun run build

RUN rm .env

# Start the application
CMD ["bun", "run", "start"]
