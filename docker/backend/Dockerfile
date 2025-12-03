# Utiliser une image de base Node.js légère
FROM node:20-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier les fichiers de dépendances et les installer
COPY ./docker/backend/package*.json ./
RUN npm install --omit=dev

# Copier le reste du code de l'application
COPY . .

# Le port sur lequel votre serveur Node.js écoute
EXPOSE 3000 

# La commande pour démarrer l'application
CMD [ "node", "index.js" ]

