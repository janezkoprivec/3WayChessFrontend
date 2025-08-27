# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# Enable corepack for yarn 4.x support
RUN corepack enable

# Copy package files and Yarn configuration for better Docker layer caching
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ .yarn/releases/

# Install dependencies
RUN yarn install 
# Install serve using npm (keeping your preference)
RUN npm install -g serve

# Copy source code (node_modules excluded via .dockerignore)
COPY src/ src/
COPY public/ public/
COPY web/ web/
COPY index.html tsconfig.json tsconfig.node.json vite.config.ts postcss.config.cjs ./

# Build the application
RUN yarn build

EXPOSE 8081

CMD [ "serve", "-s", "dist", "-l", "8081" ]