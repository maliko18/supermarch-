# Guide d'installation

Ce document explique, étape par étape, comment installer et lancer l'application de gestion de stock sur une machine Windows.

## 1. Prérequis

Avant de démarrer, vérifier que les éléments suivants sont installés :

- Node.js 18 ou version plus récente
- npm
- MySQL 8.x ou WampServer
- Ollama
- Git

## 2. Récupération du projet

Si le projet n'est pas encore présent sur la machine :

1. Cloner le dépôt GitHub
2. Ouvrir le dossier du projet dans VS Code

Commande possible :

    git clone https://github.com/maliko18/supermarch-.git

Puis :

    cd supermarch-

## 3. Installation des dépendances

### Backend

Ouvrir un terminal dans le dossier server puis exécuter :

    npm install

### Frontend

Ouvrir un second terminal dans le dossier client puis exécuter :

    npm install

## 4. Configuration de la base de données

La base utilisée par le projet s'appelle :

- supermarche_stock

Le script SQL d'initialisation est situé dans :

- server/db/init.sql

### Option A : avec WampServer et MySQL en ligne de commande

1. Démarrer WampServer
2. Vérifier que MySQL est actif
3. Exécuter la commande suivante depuis la racine du projet :

   & "C:\wamp64\bin\mysql\mysql8.4.7\bin\mysql.exe" -u root --default-character-set=utf8mb4 -e "source C:/Users/malik/OneDrive/Documents/M1 IM/s2/agile/developement/gestion de stock/server/db/init.sql"

### Option B : avec phpMyAdmin

1. Ouvrir http://localhost/phpmyadmin
2. Aller dans l'onglet Importer
3. Sélectionner le fichier server/db/init.sql
4. Cliquer sur Exécuter

## 5. Configuration du backend

Le fichier de configuration est :

- server/.env

Exemple de configuration attendue :

    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=supermarche_stock
    DB_PORT=3306

    AI_API_KEY=ollama
    AI_MODEL=llama3.2:3b
    AI_BASE_URL=http://localhost:11434/v1/chat/completions
    AI_MAX_TOKENS=250
    AI_TEMPERATURE=0.3
    AI_STOCK_CACHE_MS=15000
    AI_MAX_ALERTS=10
    AI_TIMEOUT_MS=30000

## 6. Installation et préparation d'Ollama

### Installer Ollama

Télécharger Ollama depuis le site officiel :

- https://ollama.com/download

### Télécharger le modèle utilisé par le projet

Dans un terminal, exécuter :

    ollama pull llama3.2:3b

### Vérifier qu'Ollama fonctionne

Ollama écoute normalement sur le port 11434.

Commande utile :

    ollama list

## 7. Lancement de l'application

L'application nécessite deux terminaux.

### Terminal 1 : backend

Depuis le dossier server :

    npm run dev

Le backend démarre normalement sur :

- http://localhost:3001

### Terminal 2 : frontend

Depuis le dossier client :

    npm run dev

Le frontend démarre normalement sur :

- http://localhost:5173

Si le port 5173 est déjà occupé, Vite utilisera automatiquement un autre port, par exemple 5174.

## 8. Utilisation

Une fois les deux serveurs lancés :

1. Ouvrir l'adresse affichée par Vite dans le navigateur
2. Accéder à la page d'accueil
3. Sélectionner une catégorie
4. Gérer les produits
5. Utiliser l'assistant IA pour poser des questions sur le stock

## 9. Fonctionnalités disponibles après installation

Après installation, l'application permet notamment :

- consultation des produits par catégorie
- ajout, modification et suppression de produits
- recherche produit dans une fenêtre dédiée
- filtres et tri dans une modal dédiée
- export CSV des produits
- affichage du journal des actions
- recommandations IA basées sur l'état réel du stock

## 10. Vérifications en cas de problème

### Le backend ne démarre pas

Vérifier :

- que MySQL est lancé
- que le fichier server/.env est correct
- que le port 3001 n'est pas déjà occupé

### Le frontend ne voit pas les données

Vérifier :

- que le backend tourne bien
- que le frontend tourne bien
- que la base a été initialisée avec init.sql

### L'IA répond lentement ou ne répond pas

Vérifier :

- qu'Ollama est bien démarré
- que le modèle llama3.2:3b est bien téléchargé
- que le fichier .env pointe vers Ollama

## 11. Résumé rapide des commandes

Installation :

    cd server
    npm install
    cd ../client
    npm install

Téléchargement du modèle IA :

    ollama pull llama3.2:3b

Lancement :

    cd server
    npm run dev

Dans un autre terminal :

    cd client
    npm run dev
