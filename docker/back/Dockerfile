FROM node:20

RUN apt-get update && apt-get install -y \
    bash \
    git \
    openssh-client \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./srcs/backend/package*.json ./
COPY ./srcs/backend/tsconfig*.json ./
COPY ./srcs/backend/nest-cli.json ./
COPY ./docker/.env ./

RUN npm install

COPY ./srcs/backend/prisma ./prisma
RUN npx prisma generate

COPY ./srcs/backend/src ./src

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
