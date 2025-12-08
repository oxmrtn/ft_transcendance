# docker/back/Dockerfile

# Étape 1 : Utiliser une image de base Node.js Alpine
FROM node:18-alpine

# Étape 2 : Installer les dépendances système nécessaires
# Utile pour les dépendances natives comme les outils de compilation C/C++ (bien que rares en JS pur, c'est une bonne pratique)
RUN apk add --no-cache bash git openssh python3 build-base

# Étape 3 : Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 4 : Copier les fichiers de déclaration du projet depuis le context (srcs/backend)
# et installer toutes les dépendances
COPY ./docker/back/package*.json ./
RUN npm install

# Étape 5 : Exposer le port par défaut de NestJS/Fastify
EXPOSE 3000

# Étape 6 : Générer le client Prisma 
# C'est CRUCIAL pour que NestJS puisse utiliser Prisma au démarrage du conteneur.
# Ceci est exécuté pendant la phase de build de l'image.
# Note : Vous devriez exécuter cette commande APRES avoir copié votre schéma Prisma dans le context de build.
COPY ./srcs/backend/prisma/ /app/prisma/


RUN npx prisma generate

# Étape 7 : Commande de démarrage en mode développement
# Assurez-vous d'avoir un script 'start:dev' dans votre package.json qui lance le serveur en mode watch (ex: nest start --watch)
CMD ["npm", "run", "start:dev"]