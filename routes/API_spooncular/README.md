# Spoonacular API Integration

This folder manages **all logic, routing, slicing, and API interaction** regarding the [Spoonacular](https://spoonacular.com/food-api) service.

---

## 📁 Folder Purpose
Everything related to the Spoonacular API – from raw API calls to value filtering and DB usage – happens here.

- Sending requests to the Spoonacular API
- Slicing only relevant fields (recipe "adjustment")
- Triggering DB changes (e.g., recording views, searches, or storing favorites)
- Defining REST endpoints for frontend consumption
- **Fetching and formatting analyzed preparation steps for progress tracking**

---

## 🔄 Overview: Slicing Logic

### 🔹 `sliceRecipeOverview(recipe)`
- **Use case:** When displaying a list of recipes (search, random, recent views, favorites).
- **Displayed info:** Short card – title, image, ready time, popularity, dietary tags.
- **Used in:** `/search/query`, `/random`, `/spoonacular/favorites` previews

### 🔹 `sliceRecipeDetails(recipe)`
- **Use case:** When clicking a recipe to open its full page.
- **Displayed info:** Full metadata – title, summary, image, servings, instructions, etc.
- **Used in:** `/spoonacular/:id`

### 🔹 `sliceAnalyzedInstructions(rawInstructions)`
- **Use case:** Extracting and formatting preparation steps for a given Spoonacular recipe.
- **Displayed info:** Step number + text only (stripped of internal fields).
- **Used in:** `/recipes/user/spoonacular/:id/steps` + progress tracking features

---

## 📄 Files & Responsibilities

### 1. `spooncular_connect.js`
Handles raw HTTP requests via `axios`, with proper API key injection.  
Used exclusively by `spooncular_actions.js`.

### 2. `spooncular_slices.js`
Filters Spoonacular results and returns only what is needed per use-case.  
Used by: `spooncular_actions.js`

### 3. `spooncular_actions.js`
Handles all Spoonacular-related operations.  
Responsibilities:
- Calls Spoonacular via `spooncular_connect.js`
- Slices the data (overview / full details / analyzed instructions)
- Records views, search history or favorites via `user_utils.js` if user is logged in

### 4. `spooncular.js`
Defines the REST API endpoints under `/spoonacular/`.  
Examples:
- `GET /spoonacular/random` – 3 random recipes
- `GET /spoonacular/:id` – Full recipe details
- `GET /spoonacular/search/query` – Search Spoonacular by keyword

---

## 📚 Logic Flow Example

```plaintext
[CLIENT]
    ↓ (GET /spoonacular/:id)
[ROUTER] spoonacular.js
    ↓
[ACTIONS] spoonacular_actions.js
    ↓
[CONNECT] spoonacular_connect.js ←→ Spoonacular API
    ↓
[SLICING] spooncular_slices.js
    ↓
[OPTIONAL] user_utils.js (if user is logged in)
```

---

## 🧠 Storage & DB Interactions

- **View recording:** if user is logged in and views a recipe → record in `recipe_views`
- **Search logging:** if user is logged in and performs search → store query in `search_history`
- **Favorites:** if user marks recipe as favorite → store ID in `user_favorites`
- **Preparation progress:** if user enters a recipe → initialize rows in `recipe_preparation_progress` (tracked separately per user)

📌 Spoonacular recipes are **never stored fully** in the DB – only metadata (ID, title, etc.) is referenced.  
📌 **Preparation steps for Spoonacular** are always fetched fresh per request – not persisted in local DB.

---

## 💡 Notes
- API key is injected from `.env` – never hardcoded.
- All error handling occurs at router/controller level.
- This layer delegates DB logic, not duplicates it.
