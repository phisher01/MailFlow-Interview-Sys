# Use Node.js LTS base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy rest of the code
COPY . .

# Set environment port (Render injects PORT)
ENV PORT=10000
EXPOSE 10000

# Start the server
CMD ["npm", "start"]
