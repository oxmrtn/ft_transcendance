# ------------------------------------
# STAGE 1 : BUILDER (Compilation du Front-end)
# ------------------------------------
FROM node:20 AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier et installer les dépendances
COPY ./docker/frontend/package*.json ./
RUN npm install

# Copier le reste du code source
COPY ../../srcs/front/* .

# Exécuter le script de build qui génère les fichiers statiques (e.g., dans un dossier 'dist' ou 'build')
# ASSUREZ-VOUS que ce script existe dans votre package.json
RUN npm run build 
# Si votre projet génère un dossier de sortie différent de 'dist', ajustez la ligne ci-dessous.

# ------------------------------------
# STAGE 2 : PRODUCTION (Serveur Nginx)
# ------------------------------------
# Utiliser l'image Nginx très légère (alpine)
FROM nginx:alpine

# Copier le fichier de configuration Nginx personnalisé (voir Étape 2)
COPY ./docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers statiques générés depuis l'étape 'builder'
# Assurez-vous que '/app/dist' correspond au dossier de sortie de votre build
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port par défaut de Nginx
EXPOSE 80

# La commande par défaut de Nginx démarre le serveur
CMD ["nginx", "-g", "daemon off;"]