FROM node:18-slim

# Set the working directory
WORKDIR /app

# Copy only package files for dependency installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the remaining application files
COPY . .

# Expose the application's port
EXPOSE 3000

# Add a dynamic CMD for build/start in production or dev mode
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm run build && npm run start; else npm run dev; fi"]
