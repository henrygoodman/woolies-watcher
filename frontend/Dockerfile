# Use the official Next.js image for development
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and lock file
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]