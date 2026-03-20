FROM docker:dind@sha256:e60900b4413a183173b0c12a7c34bfa7ba511fd074147a1b7974ebb296a0050b

RUN apk add npm \
    nodejs

WORKDIR /app

COPY docker/sandbox/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]

