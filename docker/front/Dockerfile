
FROM node:20-alpine

WORKDIR /app

COPY srcs/front/package.json ./
COPY srcs/front/postcss.config.mjs ./

RUN npm install

COPY docker/front/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]

EXPOSE 3000

CMD ["npm", "run", "dev"]