FROM node:20@sha256:abc255963bb4311b1f81bf45f2382df39a4041d2a975b1807d05809f1bc21bbe

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
EXPOSE 3333

COPY docker/back/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
