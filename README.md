# 🍽️ Recipe Explorer Web App – Project Overview

## 👥 Team Members
- **Lidor Mashiach** — 209280098
- **Liel Parparov** — 211937354
- **Noa Shvets** — 322548603

## 🧾 Project Description
This web system was developed as part of a software engineering project. It centers around a full-featured recipe management application, supporting:
- Personal, family, and third-party (Spoonacular) recipes
- User registration, login, favorites, views, and history
- Server-side and database operations via Node.js and MySQL

The project is divided into two main stages:
1. **Stage 1 – API Specification**
2. **Stage 2 – Server-Side Implementation** ~30 hours
3. **Stage 3 - Client Side (Frontend – Vue.js)** ~25 hours

---

## 📁 Stage 1: Specification and Planning

During this phase, we analyzed system requirements and constructed a complete API specification using **OpenAPI 3.0.3**. The design followed RESTful principles and included all endpoints necessary for:

- Authentication (register/login)
- Recipe browsing (public, family, user recipes)
- User interactions (favorites, views, planning, etc.)

🔗 [SwaggerHub – Grandma Recipes API](https://virtserver.swaggerhub.com/bgu-da5/Grandma-recipes/1.0.0)

---

## 🛠️ Stage 2: Server-Side Implementation

In this phase we implemented a fully working backend with real-time interaction with an SQL database and dynamic integration with the **Spoonacular API**.

### 🔧 Technologies Used
- **Node.js (v18.x)** – Backend runtime environment
- **Express.js** – Web framework for routing and middleware
- **MySQL (v8.x)** – Database engine
- **dotenv** – Loads environment variables
- **morgan** – Logs HTTP requests to the console
- **express-session** – Persists user session data across requests
- **cors** – Enables cross-origin requests
- **Postman & SwaggerHub** – For API testing and documentation
- **DataGrip / WebStorm** – IDEs used for development and database management

### 🧭 Code Structure Overview
- All SQL schemas defined under `sql_scripts/schema.sql`
- Initial test data loaded from `sql_scripts/initial_data.sql`
- DB connection logic in `sql_scripts/db_connection.js`
- `local_server.js` handles HTTP development on port 3000
- `server_connection.js` launches HTTPS server with certificate
- `routes/` contains route handlers and utility functions

> We separated `local_server.js` and `server_connection.js` to allow for easy switching between local HTTP development and global HTTPS deployment.

---

## 🧱 Local Setup Instructions

### ✅ Requirements
- MySQL 8.x (default port 3306, password: 123456)
- Node.js 18.x (includes `npm`)

### 📦 Installation Steps

1. **Clone the project** from GitHub
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create `.env` file** in project root:

```
## DB
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=recipes_db

## API
SPOONACULAR_API_KEY=your_api_key_here
```

4. **Run SQL setup** using WebStorm or CLI:
    - Run `schema.sql` to create all tables
    - Run `initial_data.sql` to insert sample data

> ℹ️ For full instructions see `sql_scripts/README.md`

5. **Run local server (port 3000):**
   ```bash
   node local_server.js
   ```

6. **Check Swagger UI:** [http://localhost:3000](http://localhost:3000)

---

## 🔒 Global Server Deployment

After full local testing, the system supports live deployment using an HTTPS server with certificates generated via **Certbot**.

### 🌍 Deployment Flow
1. Connect to university **VPN**
2. Use `Certbot` to generate `privkey.pem` and `fullchain.pem`
3. Place certificates inside `certificates/` folder
4. Configure HTTPS in `server_connection.js`

```bash
node server_connection.js
```

Visit via browser: [https://lln.cs.bgu.ac.il](https://lln.cs.bgu.ac.il)

---

## 🗃️ SQL Schema Overview

Our database includes 11 normalized tables. Each is documented with purpose, keys, constraints, and relationships.

📁 See full explanation in: `sql_scripts/README.md`

---

## 📌 Notes & Conventions
- `.env` is excluded from GitHub using `.gitignore`
- Do NOT push:
    - `node_modules/`
    - `.DS_Store`
    - `certificates/`
- Always `git pull` before `git push`