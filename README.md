# Projet R6A.05

## Fonctionnalités Principales

*   **Identité et Sécurité :**
    *   Création de compte avec mot de passe haché (`bcrypt`).
    *   Authentification via token **JWT** (`@hapi/jwt`).
    *   Gestion des rôles (Scopes) : `user` et `admin`.
*   **Catalogue de films :**
    *   Un administrateur peut ajouter (POST), modifier (PATCH) et supprimer (DELETE) des films.
    *   Chaque utilisateur peut lister tous les films disponibles (GET).
*   **Favoris :**
    *   Les utilisateurs (`user`) peuvent ajouter ou retirer des films de leur liste de favoris personnelle.
*   **Notifications par E-mail :**
    *   Envoi d'un e-mail de bienvenue à l'inscription.
    *   Envoi d'une newsletter à tous les utilisateurs lorsqu'un administrateur ajoute un film.
    *   Envoi d'une notification ciblée lorsqu'un de vos films favoris est modifié.
*   **Message Broker (Export CSV) :**
    *   L'administrateur peut demander l'export de tous les films au format CSV.
    *   La demande est envoyée asynchrone via **RabbitMQ** (file d'attente).
    *   Un "worker" génère le CSV en tâche de fond et l'envoie par email sans bloquer l'API.

---

## Stack Technique

*   **Framework Serveur :** Node.js avec Hapi.js (`@hapi/hapi`)
*   **Structure et Services :** Haute-Couture (`@hapipal/haute-couture`), Schmervice (`@hapipal/schmervice`)
*   **Base de Données (ORM) :** Objection.js / Knex via `Schwifty` (`@hapipal/schwifty`)
    *   *La base de données par défaut est SQLite en mémoire (`:memory:`), ce qui signifie que l'état se réinitialise au redémarrage.*
*   **Validation des données :** Joi (`joi`)
*   **E-mailing :** Nodemailer (`nodemailer`) avec [Ethereal](https://ethereal.email/) (tests)
*   **Message Broker :** RabbitMQ (`amqplib`)
*   **Documentation Swagger :** `hapi-swagger`

---

## 🚀 Installation & Exécution

### 1. Cloner et Installer
Ouvrez votre terminal dans le dossier du projet et installez les dépendances :
```bash
npm install
```

### 2. Base de données et Migrations
Actuellement, ce projet utilise par défaut **SQLite en mémoire**. Les tables et les données n'existent que durant l'exécution.
Les migrations suivantes sont appliquées automatiquement via `Schwifty` au démarrage du serveur :
*   `0-user.js` : Table des utilisateurs.
*   `1-film.js` : Table des bibliothèques de films.
*   `2-favorite.js` : Table de liaison pour les favoris.

### 3. Message Broker (Optionnel mais requis pour l'export CSV)
Afin d'utiliser l'export asynchrone CSV en tant qu'admin, **RabbitMQ** doit être lancé sur votre machine.
Si vous utilisez Docker :
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### 4. Lancer le serveur
Démarrez le serveur (un nouveau fichier `.env` doit exister) :
```bash
npm start
```
Vous verrez apparaître dans votre console :
```
Serveur démarré avec succès !
Clique ici pour ouvrir l'API : http://localhost:3000/documentation
```

Vous pouvez maintenant tester l'API directement via la page **Swagger** générée !

---

## 👨‍💻 Comment utiliser / Tester l'API

1. Rendez-vous sur `http://localhost:3000/documentation`.
2. Pour commencer, utilisez la route `POST /user` pour créer un utilisateur standard. 
3. Connectez-vous avec `POST /user/login`
4. **Récupérez le JWT** (le token) généré par la réponse de login, et insérez-le en cliquant sur le cadenas en haut à droite `Authorize` avec le préfixe **`Bearer `** (ex: `Bearer eyJhBGci...`).
5. Toutes les routes exigeant une clé sont désormais débloquées pour vos tests !

### Comment lancer le Consumer CSV ?
Ouvrez un **deuxième terminal**, positionnez-vous dans le dossier, et exécutez le worker :
```bash
node server/consumer.js
```
