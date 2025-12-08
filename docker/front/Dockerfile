# docker/front/Dockerfile

FROM node:18-alpine
WORKDIR /app
COPY ./docker/front/package*.json ./
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]