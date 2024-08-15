# Stage 1 - Build
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm prune --production

ARG API_URL
ENV API_URL=$API_URL

COPY . .

RUN npm run build

# Stage 2 - Prod
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

ARG API_URL
ENV API_URL=$API_URL

EXPOSE 3000
CMD [ "npm", "start" ]
