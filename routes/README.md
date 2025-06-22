# 📁 routes/ – Routing & Request Handling Layer

This folder manages the **main routing layer** of the backend – defining which files expose endpoints, handle user sessions, access the database, or communicate with external APIs like Spoonacular.

---

## 📂 Structure Summary

```
routes/
├── auth.js                     # Login & registration routes
├── user.js                     # Routes for favorites, views, meal plan, etc.
├── recipes.js                  # Routes for personal, family, and Spoonacular recipe actions
├── recipes_combined_utils.js   # Smart integration layer for unified recipe display
├── utils/
│   ├── recipes_utils.js        # Handles all recipe-related DB operations
│   └── user_utils.js           # Handles user data: favorites, views, meal plan
├── middleware/
│   └── verifyLogin.js          # Middleware to ensure user session is valid
└── API_spoonacular/
    ├── spooncular.js           # Defines routes for Spoonacular API calls
    ├── spooncular_actions.js   # Handles slicing + DB logging for Spoonacular responses
    ├── spooncular_connect.js   # Axios layer for connecting to Spoonacular API
    └── spooncular_slices.js    # Filters raw Spoonacular responses per use-case
```

---

## 🔁 Routing Logic

- `auth.js` – Session-based login and signup
- `user.js` – Protected routes for managing views, favorites, meal plans
- `recipes.js` – Accessing and manipulating personal, family, and Spoonacular recipe data
- `spooncular.js` – Open routes to search/view public recipes via Spoonacular
- `middleware/verifyLogin.js` – Attaches `req.user` to requests, or blocks them if unauthenticated

---

## 🧾 Authentication Flow

### `verifyLogin.js`
- Checks if session is active (`req.session.user_id`)
- Validates that the user exists in the DB
- If valid → injects `req.user.user_id` into downstream handlers
- Used explicitly in `user.js`, `recipes.js`, **not** in Spoonacular routes (which allow guest access)

---

## 🔄 Guest-Friendly Routing

Some actions like:
- Viewing a Spoonacular recipe
- Performing a public search (`/spoonacular/search/query`)
- Fetching random recipes

... do **not require login**, but will **log actions** (e.g., search, view) if the user is logged in.

---

## 🧠 Special Logic: `recipes_combined_utils.js`

This file plays a **central role** when displaying multiple recipes together from **mixed sources**:
- It takes an array of `{ source, id }` references (e.g., `"spoonacular"`, `"user"`, `"family"`)
- It decides whether to fetch the recipe from Spoonacular, the user DB, or family recipes
- It's used in features like:
  - Viewing all favorites
  - Viewing recent recipe views
  - Viewing meal plans

It orchestrates logic across `spooncular_actions.js`, `user_utils.js`, and `recipes_utils.js` to return unified recipe objects for the frontend.

📌 Without this file, you would have to manually determine the source of each recipe and call the correct fetch function.

---

## ✅ Responsibility by Table (Cross-File Map)

| Database Table               | user.js / user_utils.js | recipes.js / recipes_utils.js | auth.js |
|------------------------------|--------------------------|-------------------------------|---------|
| users                        | ✅ (via login/register)   | ❌                            | ✅      |
| user_favorites               | ✅                        | ❌                            | ❌      |
| recipe_views                 | ✅                        | ❌                            | ❌      |
| search_history               | ✅                        | ❌                            | ❌      |
| meal_plans                   | ✅                        | ❌                            | ❌      |
| user_recipes                 | ❌                        | ✅                            | ❌      |
| user_recipe_ingredients      | ❌                        | ✅                            | ❌      |
| family_recipes               | ❌                        | ✅                            | ❌      |
| family_recipe_ingredients    | ❌                        | ✅                            | ❌      |
| recipe_preparation_steps     | ❌                        | ✅                            | ❌      |
| recipe_preparation_progress  | ❌                        | ✅                            | ❌      |

---
### ⚠️ Circular Dependency Handling

In the `routes/` layer of the project, several utility modules interact with one another. However, due to complex interdependencies, loading all required modules at the top of the file may result in a **circular dependency** – where one module depends on another that (directly or indirectly) depends back on the first one.

To avoid this, `require()` calls for certain modules (specifically utility modules) are **placed inside the functions that use them** instead of at the top of the file.

---

#### ⚙️ Dependency Flow

```
spooncular_actions
      ↓
   user_utils
    ↙       ↘
recipes   recipes_combined_utils
    ↑           ↓
    └──────── spooncular_actions
```

This diagram shows how:
- `spooncular_actions.js` uses `user_utils.js`
- `user_utils.js` depends on both `recipes_utils.js` and `recipes_combined_utils.js`
- `recipes_combined_utils.js`, in turn, imports `spooncular_actions.js` again

---

#### ✅ Example (Inside `spooncular_actions.js`)

Instead of:
```js
const userUtils = require("../utils/user_utils");
```

We use:
```js
function fetchRecipesBySearch(...) {
    const userUtils = require("../utils/user_utils");
    ...
}
```

This ensures the module loads only **after** its dependencies are ready.

---

## 🔄 New Recipe Routing Capabilities

As of the latest system updates, `recipes.js` now supports routing and progress tracking for:
- `spoonacular` recipes (read-only, with progress tracking only)
- `my-recipes` and `my-family-recipes` (full CRUD)

Progress is always tracked via the shared `recipe_preparation_progress` table, regardless of source.

---
## 🔄 Automatic Synchronization Between Preparation Steps and Progress

The route system now includes automatic mechanisms that synchronize between the `recipe_preparation_steps` and `recipe_preparation_progress` tables. Below are the key behaviors:

- ✅ Creating a step (`POST /steps`) automatically creates a corresponding progress entry for the current user.
- 🔁 When inserting a step with an existing step number, all steps with greater or equal numbers are shifted forward — and corresponding progress entries are shifted as well.
- 🗑️ Deleting a step also deletes its corresponding progress entry, and remaining steps are shifted backward in both tables.
- ✏️ Updating a step description (only the description) does **not** affect progress.
- 🔁 A recipe reset operation marks all progress entries as uncompleted, effectively resetting the progress tracking.

These behaviors apply to all recipe types: personal, family, and Spoonacular-based.

---

## 🔑 Notes

- No route file talks directly to the DB – always through `*_utils.js`
- Only `recipes_combined_utils.js` supports hybrid queries across sources (e.g. meal plan)

