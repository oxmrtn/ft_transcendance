FROM node:20-alpine

RUN apk add --no-cache \
    bash \
    git \
    openssh-client \
    python3 \
    make \
    gcc \
    g++
    
WORKDIR /app

COPY ./srcs/backend/package*.json ./
COPY ./srcs/backend/tsconfig*.json ./
COPY ./srcs/backend/nest-cli.json ./

COPY docker/back/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3333

ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "run", "start:dev"]