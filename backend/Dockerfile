FROM node:18-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 5000

# Add a script to check NODE_ENV and run the appropriate command
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm run build && npm run start; else npm run dev; fi"]
