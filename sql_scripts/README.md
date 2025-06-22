# 🗃️ SQL Scripts & Data Access Layer

This folder contains both the **SQL schema and seed scripts** (`schema.sql`, `initial_data.sql`) and the **Node.js layer for querying the DB** (`data_access/`).

The system uses clear separation between:
- 🧱 SQL definitions (tables, FKs)
- ⚙️ Programmatic logic (CRUD access)

---

## 📦 Folder Structure

```
sql scripts/
├── schema.sql                  # Creates the entire schema (11 tables)
├── initial_data.sql           # Optional: populates DB with sample users & recipes
├── db_connection.js        # Pooled MySQL connection (dotenv config)
└── data_access/
    ├── user_db.js              # Handles basic user creation & lookup
    ├── user_favorites_db.js    # Favorites-related queries
    ├── recipe_views_db.js      # Tracks recipe views (Spoonacular)
    ├── search_history_db.js    # Logs search filters
    ├── meal_plans_db.js        # User meal planning (multi-source)
    ├── recipe_preparation_progress_db.js
    ├── recipe_preparation_steps_db.js
    ├── user_recipes_db.js
    ├── user_recipe_ingredients_db.js
    ├── family_recipes_db.js
    └── family_recipe_ingredients_db.js
```

---

## 🧩 JS ↔ SQL Integration: `data_access` Layer

The directory `sql_scripts/data_access/` holds all logic for interacting with the database programmatically via **Node.js**.

Each file represents a single table and provides **CRUD operations** written in JavaScript using async/await with MySQL.

For example:

```js
const db = require("../db_connection");
```
- This line imports a pooled MySQL connection (from `db_connection.js`)
- It automatically uses credentials from the `.env` file
- It ensures the system doesn’t open or close connections per request

Each file ends with:

```js
module.exports = {
  functionName1,
  functionName2,
  ...
}
```
- This exposes the listed functions to other parts of the project
- For example: your route handlers (e.g., `routes/user.js`) can call `createUser(...)` directly
---

## 📌 Setup Instructions

1. Ensure your `.env` file includes the following values:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=recipes_db
```

2. Open `schema.sql` and run it:
    - The script contains a `USE recipes_db;` statement
    - If the database does **not** yet exist, uncomment the first line:
      ```sql
      CREATE DATABASE IF NOT EXISTS recipes_db;
      ```

3. Execute `initial_data.sql` to populate example rows for testing.

4. Make sure your SQL dialect is set to **MySQL** in WebStorm or your IDE.

---

## 📋 SQL Syntax & Compatibility

- Syntax must be set to `MySQL` (not `Generic SQL`) for WebStorm/JetBrains IDEs.
- All tables use proper keys, constraints, and relationships.
- Use a proper MySQL interpreter (e.g., WebStorm, DataGrip, CLI).

---

## 📘 FK Constraints – Explanation

**FK** stands for **Foreign Key** – a constraint used to link child tables to parent tables using consistent reference values (e.g., `user_id`, `recipe_id`).

---

## 🧱 Tables Overview

Each table below includes:

- **Purpose**
- **Primary Key**
- **Relation to other tables**
- **Whether it’s mandatory or bonus**
- **Justification in the model**

---

### 1. `users` – ✅ Required

- **Purpose**: Stores registered user info: username, name, country, email, password
- **PK**: `user_id`
- **Used In**: All other tables as foreign key
- **Why**: Central identity table

---

### 2. `user_recipes` – ✅ Required

- **Purpose**: Recipes created by users
- **PK**: `recipe_id`
- **FK**: `user_id → users(user_id)`
- **Why**: Lets each user manage their own custom content

---

### 3. `user_recipe_ingredients` – ✅ Required

- **Purpose**: Ingredients belonging to user recipes
- **PK**: `ingredient_id`
- **FK**: `recipe_id → user_recipes(recipe_id)`
- **Why separate**: Many-to-one relationship; avoid clutter in main table

---

### 4. `family_recipes` – ✅ Required

- **Purpose**: User-contributed family-style recipes with a story, preparation context, and legacy value (owner name, when-to-prepare).
- **PK**: `recipe_id`
- **FK**: `user_id → users(user_id)`
- **Why separate**: Different fields (owner, heritage text)

---

### 5. `family_recipe_ingredients` – ✅ Required

- **Purpose**: Ingredients for family recipes
- **PK**: `ingredient_id`
- **FK**: `recipe_id → family_recipes(recipe_id)`
- **Why separate**: Keeps family structure consistent and normalized

---

### 6. `user_favorites` – ✅ Required

- **Purpose**: Links users to external Spoonacular recipes they marked as favorites
- **PK**: `favorite_id`
- **FK**: `user_id`
- **Why**: Needed for favorites tab + API integration

---

### 7. `recipe_views` – ✅ Required

- **Purpose**: Tracks user views of Spoonacular recipes
- **PK**: `view_id`
- **FK**: `user_id`
- **Why**: Used for “recently viewed” section

---

### 8. `search_history` – ✅ Required

- **Purpose**: Logs search inputs + filters
- **PK**: `search_id`
- **FK**: `user_id`
- **Why**: Used for “previous searches” feature

---

### 9. `meal_plans` – ✅ Bonus

- **Purpose**: Weekly plan (mix of all recipe types)
- **PK**: `plan_id`
- **FK**: Points to one of three recipe sources (spoonacular, user, family) – enforced programmatically, not via strict FK.
- **Why**: Advanced personalization

---

### 10. `recipe_preparation_progress` – ✅ Bonus

- **Purpose**: Track step-by-step live cooking progress
- **PK**: `progress_id`
- **FKs**: `user_id` and one of the 3 recipe sources
- **Why**: Real-time cooking flow

---

### 11. `recipe_preparation_steps` – ✅ Bonus

- **Purpose**: Holds structured steps for user/family recipes
- **PK**: `step_id`
- **FK**: Either `user_recipe_id` or `family_recipe_id`
- **Why**: Normalize recipe steps into a dedicated, queryable table

---

## 🔐 Access Control Model

Only the recipe owners may view, edit, or delete their personal (`user_recipes`) or family (`family_recipes`) content.  
All validations are implemented in the respective DB access files (`*_db.js`) and not in the route or logic layers.

The `data_access` layer is also responsible for validating user permissions when modifying personal content (e.g., verifying that a recipe or ingredient belongs to the requesting user). This ensures consistent access control across all database operations.

---

## 🧠 Special Logic Notes

- `user_favorites`, `recipe_views`, and `search_history` only apply to **Spoonacular** recipes.
- Internal recipes (`user_recipes`, `family_recipes`) are accessed via their own access files and contain richer structure (ingredients, steps, etc.)
- `meal_plans` is **multi-source**, and its entries may point to any of: spoonacular ID, user ID, or family ID – logic handled in higher layers.
- The `recipe_preparation_progress` table includes dynamic tracking per user and recipe – great for interactive UIs.

### 🔍 Search History vs. Recipe Views

While both tables record user interactions, they serve distinct purposes:

- **search_history** tracks _what the user typed_ and _filters they applied_ (cuisine, diet, intolerances).
- **recipe_views** only tracks _which recipes_ were viewed, and only applies to **Spoonacular recipes** (external API).

This separation allows the system to analyze search intent vs. actual behavior.

### 🔄 Automatic Sync Between Steps and Progress

The system automatically keeps the `recipe_preparation_steps` and `recipe_preparation_progress` tables in sync:

- ✅ Adding a new step creates a corresponding `progress` entry for the current user.
- 🔁 Inserting a step at an existing number shifts all later steps forward – and updates `progress` accordingly.
- 🗑️ Deleting a step also deletes its `progress` entry – remaining steps are renumbered in both tables.
- ✏️ Editing the step description does not affect progress.
- 🔁 Resetting a recipe clears the `is_completed` status and timestamp for all related steps.

These behaviors apply to all recipe types: user-created, family, and Spoonacular.

---

## ✅ Summary

The `data_access` layer wraps raw SQL into clean, reusable functions.

It guarantees:
- Code clarity
- Database consistency
- No hardcoded logic outside

Everything from saving favorites, logging views, planning meals, and tracking recipe steps is centralized here.