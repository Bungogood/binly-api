FROM node:lts-alpine

WORKDIR /app 
COPY package.json . 
COPY yarn.lock .

RUN yarn install 

COPY . .
COPY docker.config.json config.json

EXPOSE 80
CMD npm run start 
