FROM node:20-alpine AS builder

# Build arguments for environment variables
ARG VITE_QUOTES_API_URL=https://api.geofal.com.pe
ENV VITE_QUOTES_API_URL=$VITE_QUOTES_API_URL

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (need devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
