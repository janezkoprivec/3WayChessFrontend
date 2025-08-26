# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# Enable corepack for yarn 4.x support
RUN corepack enable

COPY package.json .

RUN yarn install 

RUN npm install -g serve

COPY . .

RUN yarn build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]