# 📁 Routes & Data Access Structure

This document outlines the structure, responsibilities, and design considerations behind the routing layer (`routes/`) of our system. It explains the separation between `user.js`, `recipes.js`, and `auth.js`, the supporting logic files in `utils/`, and the new middleware authentication mechanism.

---

## 🧩 Purpose of Each File

| File                     | Purpose |
|--------------------------|---------|
| **user.js / user_utils.js**      | Manages user-related actions (favorites, views, history, meal plans). Requires active session via `verifyLogin`. |
| **recipes.js / recipes_utils.js** | Handles all types of recipes (Spoonacular, user, family). Fetches, aggregates, and formats recipe data. |
| **auth.js**              | Handles login & registration. Grants session via `req.session.user_id`. First access point to the `users` table. |
| **verifyLogin.js**       | Middleware for validating active user session. Shared by `user.js` and `recipes.js`. Validates user ID from session and injects `req.user_id`. |
| **DButils.js**           | Legacy query wrapper with transaction support. Provided by course staff. Still used in `verifyLogin.js` to avoid breaking compatibility. |
| **MySql.js**             | Legacy low-level pool manager for `DButils.js`. Manages raw connection/query/release flow. |
| **db_connection.js**     | Modern, central DB access file used by all `data_access/*.js` modules. Wraps connection pool and exports query functions. |
### 🔁How They Interact
`DButils.js` and `MySql.js` were included in the starter project. We replaced them with `db_connection.js` for modularity. However, `verifyLogin.js` still uses `DButils.js`, so we kept both legacy files to maintain compatibility.

---

## 🧾 Responsibilities Breakdown

### 🔐 `auth.js`
- Handles login and registration only.
- Does **not** assume the user is logged in.
- Uses `user_db.js` internally (insert/select).

### 👤 `user.js`
- Requires login (via middleware).
- Handles all personal actions for a logged-in user:
  - Favorites (add/remove/list)
  - Views history
  - Meal plans
  - Personal/family recipe creation
- Uses logic from `user_utils.js`.

### 🍲 `recipes.js`
- Requires login (via middleware).
- Handles general recipe views and exploration.
- Uses logic from `recipes_utils.js`.

---

## 🔒 Password Security with bcrypt

### 🔑 How bcrypt Works in Our System

**During Registration (`auth.js`):**
- We use `bcrypt.hashSync(password, parseInt(process.env.BCRYPT_ROUNDS))` to encrypt the password
- The `BCRYPT_ROUNDS` environment variable determines the encryption strength level
- The encrypted password (hash) is stored in the database

**During Login (`auth.js`):**
- We use `bcrypt.compareSync(password, user.hashedPassword)` to verify the password
- `password` = the plain text password entered by the user
- `user.hashedPassword` = the encrypted password from the database
- **Important:** We don't need to specify the encryption rounds again because bcrypt automatically detects the encryption level from the stored hash itself

### 🛡️ Security Benefits
- The actual encryption strength (`BCRYPT_ROUNDS=11`) is hidden in the `.env` file
- Users and potential attackers cannot see the encryption level from the code
- bcrypt automatically handles the complexity of comparing plain text against encrypted passwords

---

## 🔄 Middleware Authentication – `verifyLogin.js`

### ✅ Why Middleware?
To avoid duplicating session validation in every single route – we centralize login verification using Express middleware.

### 🔁 How It Works
- Both `user.js` and `recipes.js` include:
  ```js
  const verifyLogin = require("../middleware/verifyLogin");
  router.use(verifyLogin);
  ```
- This ensures **all routes below it** will execute `verifyLogin` **before** reaching their handler.
- The file `verifyLogin.js` performs:
  - Checks that `req.session.user_id` exists.
  - Validates the user exists in the DB.
  - Adds `req.user_id` for downstream usage.

### 🔄 Trigger Frequency
Middleware is **executed per request**. So if a user:
- Marks a favorite (POST)
- Then immediately deletes one (DELETE)

Each call will re-run `verifyLogin`. This is essential for secure access.

---

## 🧠 Key Design Insight

- `auth.js` is about *obtaining* a session.
- `verifyLogin.js` is about *validating* a session.

This distinction avoids confusion and improves maintainability.

---
## ✅ Summary Table – Data Access Ownership

This table defines **which file** is responsible for each `data_access` module:

| Database Table               | user.js / user_utils.js | recipes.js / recipes_utils.js | auth.js |
|------------------------------|--------------------------|-------------------------------|---------|
| users                        | ✅ (via login/register)   | ❌                            | ✅      |
| user_favorites               | ✅                        | ❌                            | ❌      |
| recipe_views                 | ✅                        | ❌                            | ❌      |
| search_history               | ✅                        | ❌                            | ❌      |
| meal_plans                   | ✅                        | ❌                            | ❌      |
| user_recipes                 | ❌ (Only for 1 scenario)  | ✅                            | ❌      |
| user_recipe_ingredients      | ❌                        | ✅                            | ❌      |
| family_recipes               | ❌                        | ✅                            | ❌      |
| family_recipe_ingredients    | ❌                        | ✅                            | ❌      |
| recipe_preparation_steps     | ❌                        | ✅                            | ❌      |
| recipe_preparation_progress  | ❌                        | ✅                            | ❌      |