# Fichier : docker/backend/Dockerfile

# Utiliser une image de base Node.js légère
FROM node:20-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# --- NOUVELLE ÉTAPE : Installer les outils de compilation pour sqlite3 ---
RUN apt-get update && \
    apt-get install -y build-essential python3 && \
    rm -rf /var/lib/apt/lists/*

# Copier les fichiers de dépendances et les installer
COPY ./docker/backend/package*.json ./
# Maintenant, cette commande devrait réussir car les outils de build sont présents
RUN npm install --omit=dev

# Le port sur lequel votre serveur Node.js écoute
EXPOSE 3000 

# La commande pour démarrer l'application
CMD [ "node", "index.js" ]