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
EXPOSE 3000

CMD ["npm", "run", "start:dev"]

COPY docker/back/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]