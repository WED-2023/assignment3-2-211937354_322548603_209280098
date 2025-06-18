# 🍽️ Recipe Explorer Web App – Project Overview

## 👥 Team Members
- **Lidor Mashiach** — 209280098
- **Liel Parparov** — 211937354
- **Noa Shvets** — 322548603

## 🧾 Description

This project is a recipe management platform that supports:
- 👤 Personal recipes
- 👨‍👩‍👧‍👦 Family recipes
- 🌐 External recipes via the Spoonacular API

It includes features such as:
- User login and authentication
- Favorites and search history
- Recently viewed recipes
- Step-by-step preparation tracking
- Weekly meal plans


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
- **Other tools**: axios, morgan

### 📁 Project Structure

```
.
├── routes/                          # API entry points
│   ├── auth.js                      # Login & registration
│   ├── user.js                      # Favorites, views, meal plan
│   ├── recipes.js                   # Personal/family recipe logic
│   ├── recipes_combined_utils.js   # Multi-source recipe merger
│   ├── utils/                       # Logic for users & recipes
│   ├── middleware/                 # Session verification
│   └── API_spoonacular/            # All logic for 3rd-party API
│       ├── spooncular.js
│       ├── spooncular_actions.js
│       ├── spooncular_connect.js
│       └── spooncular_slices.js
│
├── sql scripts/
│   ├── schema.sql                  # SQL schema (11 tables)
│   ├── initial_data.sql            # Optional data seeds
│   └── data_access/                # JS-based DB interface (1 file per table)
│
├── .env                            # API key, DB credentials
├── Dockerfile                      # Optional deployment container
├── server_connection.js           # HTTPS version (deployment)
├── package.json                    # Dependencies
└── README.md                       # This file
```


---

### 🧱 Local Setup Instructions

#### ✅ Requirements
- MySQL 8.x (default port 3306, password: 123456)
- Node.js 18.x (includes `npm`)

#### 📦 Installation Steps

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
   node main.js
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
> ⚠️ **Important Note – Keep the Remote Session Active**  
> Once you start the global server with `node server_connection.js`, make sure to **keep the Remote Desktop session open**.  
> Closing or disconnecting from the remote session will **terminate the server process** and shut down the domain.
>
> To keep the server running:
> - Leave the Remote Desktop window open in the background.
> - Or configure your session to stay alive after disconnect (requires admin-level group policy changes).
>
> 🔁 You can always restart the server by reconnecting and running the command again.


### 🔗 Team Access to the Global Server

Once the HTTPS server is up and running with a valid certificate, your teammates **do not need to generate their own SSL files or connect via VPN**.

They can simply access the server using the following URL from any browser or tool (e.g., Postman):

> https://lln.cs.bgu.ac.il

✅ Make sure the server is active when accessing this URL. If it's shut down, a timeout or certificate error will occur.


---

## 🗃️ SQL Schema Overview

The schema includes **11 tables**, split between required and bonus.
Each table has its own JS access layer in `data_access/`, and each route layer delegates work through `utils/`.

📁 See full explanation in: `sql_scripts/README.md`


---

## 🌐 Spoonacular API

The project integrates with the Spoonacular food API to allow external recipe searches.

- Users can:
    - Search for recipes by keyword, diet, cuisine
    - View random recipes
    - View detailed recipe info by ID
- All retrieved recipes are sliced to store only the required fields
- If a user is logged in, the system logs:
    - Search history (`search_history`)
    - Viewed recipes (`recipe_views`)
    - Favorites (`user_favorites`)

📌 External recipes are **not fully stored** – only metadata is saved.



---

## ✅ Authentication

- Login and signup are done via `auth.js`
- Sessions are stored in memory using `express-session`
- Only some routes require login (`verifyLogin.js` middleware)
- Spoonacular routes allow guest access (but log interactions only for logged-in users)

---

## 📌 Notes & Conventions
- `.env` is excluded from GitHub using `.gitignore`
- Do NOT push:
    - `node_modules/`
    - `.DS_Store`
    - `certificates/`
- Always `git pull` before `git push`




---

## 📌 Remote MySQL Notes

> ⚠️ When deploying on the university remote server, the MySQL password is **different** from your local environment.

On the remote machine, MySQL is pre-installed with the following credentials:

```
DB_USER=root
DB_PASSWORD=@123123
```

✅ Update your `.env` file accordingly **before running the server remotely**.

In your local machine, the password remains:

```
DB_PASSWORD=123456
```

📌 You can maintain **two separate `.env` files** (e.g., `.env_local`, `.env_remote`) and rename them based on where you're running.

---

## 🔀 Switching `main.js` Versions

Because the backend behaves differently when run locally vs. remotely (with the university's HTTPS and frontend expectations), two versions of the `main.js` file are provided:

| File                          | Use Case                                           | Notes |
|-------------------------------|----------------------------------------------------|-------|
| `Local_main_version(Original).txt`     | 🧪 Local testing (`node main.js`)                  | - Includes development settings like port 3000<br>- Used in local machines with local MySQL |
| `remote_server_main_version.txt`       | 🌐 Remote deployment (`node server_connection.js`) | - Includes necessary tweaks for HTTPS & frontend integration<br>- Matches university server requirements |

📥 To switch versions:
1. Open the appropriate TXT file
2. Copy-paste its contents into `main.js`
3. Save and restart the server (local or remote)

🚫 Do **not** commit `main.js` with remote-specific changes to GitHub unless needed by all teammates.

---