FROM node:alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
COPY docker.config.json config.json

EXPOSE 80

CMD ["npm", "run", "start"]