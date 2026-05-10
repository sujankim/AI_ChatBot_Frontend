# ══════════════════════════════════════════════════════════
# STAGE 1: BUILD Angular
# Goal: Compile TypeScript + bundle → static HTML/JS/CSS files
# ══════════════════════════════════════════════════════════

# Node.js 22 on Alpine Linux (matches your Node version)
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# ── Dependency Layer (cached if package.json doesn't change) ──

# Copy ONLY package files first (not source code)
# If package.json hasn't changed → npm ci is cached → fast builds!
COPY package.json package-lock.json ./

# Install dependencies
# npm ci = "clean install" (uses exact versions from package-lock.json)
# --silent = less output noise in build logs
RUN npm ci --silent

# ── Source Code Layer ──

# Copy all source files
COPY . .

# Build Angular for production
# --configuration=production:
#   - Enables optimizations
#   - Minifies JavaScript (removes whitespace, shortens variable names)
#   - Tree-shakes (removes unused code)
#   - Enables AOT (Ahead of Time compilation)
#   - Result: much smaller and faster than development build
RUN npm run build -- --configuration=production

# ══════════════════════════════════════════════════════════
# STAGE 2: SERVE with Nginx
# Goal: Serve static files to users efficiently
# Nginx is a high-performance web server
# Much better than Node.js for serving static files
# ══════════════════════════════════════════════════════════

FROM nginx:alpine AS runtime

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built Angular files from Stage 1
# ⚠️  IMPORTANT: Change 'chat-bot-frontend' to match YOUR angular.json outputPath
COPY --from=build /app/dist/chat-bot-frontend/browser /usr/share/nginx/html

# Nginx serves on port 80 inside the container
EXPOSE 80

# Nginx starts automatically (it's the default CMD of the nginx image)
# No ENTRYPOINT needed
