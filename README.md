# CarRent — Application de location de voiture

Ce projet est une application de gestion de location de voitures (frontend + backend) en **Node.js / Express / MySQL**.

## 📦 Structure du projet

- `backend/` : code Node.js + Express + Sequelize (API REST)
- `Frontend/` : pages HTML/CSS/JS (interface utilisateur)
- `database/schema.sql` : script SQL pour créer les tables MySQL

## ✅ Technologies

- **Backend** : Node.js, Express.js, Sequelize (MySQL), JWT, bcrypt
- **Frontend** : HTML, CSS, JavaScript (vanilla)
- **Base de données** : MySQL

## 🚀 Installation et démarrage

### 1) Installer MySQL

1. Installez MySQL (ou MariaDB)
2. Créez une base de données `carrent` (ou modifiez le `.env` pour adapter le nom)

### 2) Importer le schéma SQL

Depuis votre client MySQL :

```sql
SOURCE database/schema.sql;
```

### 3) Configuration de l'environnement

Dans `backend/.env`, mettez les bonnes valeurs pour :

- `DB_HOST` (ex: localhost)
- `DB_USER` (ex: root)
- `DB_PASSWORD` (mot de passe MySQL)
- `DB_NAME` (ex: carrent)
- `JWT_SECRET` (n'importe quelle clé secrète)

### 4) Installer les dépendances

```bash
cd backend
npm install
```

### 5) Créer un compte admin (optionnel)

L'application gère les rôles `admin`, `entreprise`, `client`.
Pour créer un compte `admin`, exécutez :

```bash
cd backend
npm run seed
```

Vous pouvez modifier `ADMIN_EMAIL` / `ADMIN_PASSWORD` dans le fichier `backend/.env`.

### 6) Démarrer le backend

```bash
cd backend
npm run dev
```

Le backend écoute sur `http://localhost:5000`.

### 6) Ouvrir le frontend

Le projet sert automatiquement le frontend via Express. Ouvrez :

```
http://localhost:5000/
```

---

## 🛠️ Endpoints disponibles

**Authentification**
- `POST /register` → inscription
- `POST /login` → connexion

**Voitures**
- `GET /voitures` → lister les voitures (`?minPrix=...&maxPrix=...&statut=...`)
- `POST /voitures` → ajouter une voiture (entreprise/admin)
- `PUT /voitures/:id` → modifier une voiture (proprio/admin)
- `DELETE /voitures/:id` → supprimer une voiture (proprio/admin)
- `POST /voitures/:id/photo` → upload photo (multipart/form-data)

**Réservations**
- `POST /reservations` → créer une réservation (client)
- `GET /reservations` → lister les réservations (admin / entreprise / client)
- `GET /mes-reservations` → lister mes réservations (client)

**Entreprises**
- `GET /entreprises` → lister (admin)
- `POST /entreprises` → créer (admin)

---

## 🧭 Utilisation rapide

1. Créez un compte sur `/inscription.html`
2. Connectez-vous sur `/connexion.html`
3. Selon le rôle (client / entreprise / admin), vous aurez un dashboard adapté

---

## 🧩 Bonus inclus

- Upload d'image pour les voitures (`/voitures/:id/photo`)
- Filtrage des voitures par prix / disponibilité
- Dashboard simple pour les entreprises (gestion des voitures + réservations)

---

Si vous souhaitez enrichir l'interface (ex: recherche en temps réel, pagination, gestion plus fine des états), je peux vous guider étape par étape.
