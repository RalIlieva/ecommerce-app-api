# Stage 1: Build the React app
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install
RUN npm install bootstrap @fortawesome/fontawesome-free

# Copy the rest of the application files
COPY . .

# Build the app for production
RUN npm run build && ls -alh /app/dist  # Debugging step to confirm the build directory

# Stage 2: Serve the React app using Nginx
FROM nginx:stable-alpine

# Copy the build output to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to be accessible from the outside
EXPOSE 80

# Run Nginx in the foreground (default command)
CMD ["nginx", "-g", "daemon off;"]
