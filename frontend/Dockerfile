# Use the official Node.js image optimized for Alpine Linux
FROM node:22-alpine

# Set environment variables for production and minimize cache busting
ENV NODE_ENV=development

# Set the working directory
WORKDIR /app

# Copy only package.json and lock file first (leverage Docker caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --verbose || cat /root/.npm/_logs/*.log

# Copy the rest of the application
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# Run the development server
CMD ["npm", "run", "dev"]
