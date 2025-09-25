    # Use official Node.js image
    FROM node:20-alpine

    # Set working directory inside container
    WORKDIR /app

    # Copy package files first (for better caching)
    COPY package*.json ./

    # Install dependencies
    RUN npm install --production

    # Copy the rest of the application code 
    COPY . .

    # Expose the port the app runs on
    EXPOSE 8080


    # Run the app
    CMD ["npm", "start"]
