FROM docker:dind

RUN apk add npm \
    nodejs

WORKDIR /app

COPY docker/sandbox/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]

CMD ["npm", "run", "start:dev"]

