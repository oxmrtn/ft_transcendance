FROM node:18-alpine

RUN apk add --no-cache bash git openssh python3 build-base

WORKDIR /app

COPY ./docker/back/package*.json ./

RUN npm install

EXPOSE 3000

COPY ./srcs/backend/prisma/ /app/prisma/

RUN npx prisma generate

CMD ["npm", "run", "start:dev"]