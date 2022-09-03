FROM node:lts-alpine

WORKDIR /api

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN npx prisma generate

EXPOSE 80
CMD yarn dev
