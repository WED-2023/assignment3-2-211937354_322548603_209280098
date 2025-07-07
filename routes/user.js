const express = require("express");
const router = express.Router();
const verifyLogin = require("./middleware/verifyLogin");
const userUtils = require("../routes/utils/user_utils");
const { fetchRecipesBySearch } = require("../routes/API_spooncular/spooncular_actions");
const favoritesDB = require("../sql_scripts/data_access/user_favorites_db");

/** Middleware to verify user session */
// Middleware to secure all /user routes
router.use(verifyLogin);


/** Favorites */
router.get("/favorites", async (req, res, next) => {
  try {
    const favorites = await userUtils.getFavoriteRecipes(req.user_id);
    res.status(200).send(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    next(error);
  }
});

router.get("/favorite-ids", async (req, res, next) => {
  try {
    const rawFavorites = await favoritesDB.getFavoritesByUserId(req.user_id);
    const ids = rawFavorites.map(f => f.spoonacular_recipe_id);
    res.status(200).send(ids);
  } catch (error) {
    console.error("Error fetching favorite IDs:", error);
    next(error);
  }
});

router.post("/favorites", async (req, res, next) => {
  try {

    await userUtils.addFavoriteRecipe(req.user_id, req.body.recipeId);
    res.status(200).send({ message: "Saved to your favorites – bon appétit!" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    next(error);
  }
});

router.delete("/favorites/:recipeId", async (req, res, next) => {
  try {
    await userUtils.removeFavorite(req.user_id, req.params.recipeId);
    res.status(200).send({ message: "Recipe removed from your faves 😢" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    next(error);
  }
});

/** Views */

// router.get("/my-last-watched", async (req, res, next) => {
//   try {
//     const viewed = await userUtils.getViewedRecipes(req.user_id);
//     res.status(200).send(viewed);
//   } catch (error) {
//     console.error("Error fetching last watched:", error);
//     next(error);
//   }
// });
//
// Get the last 3 viewed recipes with full details
router.get("/recently-viewed", async (req, res, next) => {
  try {
    const recipes = await userUtils.getRecentlyViewedRecipes(req.user_id);
    res.status(200).send(recipes);
  } catch (err) {
    next(err);
  }
});

//all last viewed ids
router.get("/viewed-ids", async (req, res, next) => {
  try {
    const views = await userUtils.getAllViewedRecipeIds(req.user_id);
    res.status(200).send(views);
  } catch (err) {
    next(err);
  }
});


router.post("/mark-as-viewed", async (req, res, next) => {
  try {
    const { recipe_id, source } = req.body;

    if (!recipe_id || !source) {
      return res.status(400).send({ message: "Missing recipe_id or source" });
    }

    const params = {
      spoonacularId: source === "spoonacular" ? recipe_id : null,
      userRecipeId: source === "my-recipes" ? recipe_id : null,
      familyRecipeId: source === "my-family-recipes" ? recipe_id : null
    };

    await userUtils.addViewedRecipe(req.user_id, params);

    res.status(201).send({ message: "Recipe marked as viewed" });

  } catch (error) {
    console.error("Error marking recipe as viewed:", error);
    next(error);
  }
});



router.delete("/views", async (req, res, next) => {
  try {
    await userUtils.clearViewedHistory(req.user_id);
    res.status(200).send({ message: "Viewing history cleared successfully." });
  } catch (error) {
    console.error("Error clearing viewing history:", error);
    next(error);
  }
});


/** Search history */

router.get("/search-history", async (req, res, next) => {
  try {
    const lastSearch = await userUtils.getLastSearchQuery(req.user_id);
    if (lastSearch) {
      res.status(200).send(lastSearch);
    } else {
      res.status(404).send({ message: "No recent search found for this user." });
    }
  } catch (error) {
    console.error("Error retrieving search history:", error);
    next(error);
  }
});

router.get("/last-search-results", async (req, res, next) => {
  try {
    const lastSearch = await userUtils.getLastSearchQuery(req.user_id);
    if (!lastSearch || !lastSearch.search_query) {
      return res.status(404).send({ message: "No recent search found for this user." });
    }

    const searchParams = {
      query: lastSearch.search_query,
      cuisine: lastSearch.cuisine_filter,
      diet: lastSearch.diet_filter,
      intolerances: lastSearch.intolerance_filter,
      number: lastSearch.results_limit || 5
    };

    const recipes = await fetchRecipesBySearch(searchParams, null); 

    res.status(200).send({
      searchMeta: searchParams,
      recipes
    });

  } catch (error) {
    console.error("Error running last search again:", error);
    next(error);
  }
});

router.post("/search-history", async (req, res, next) => {
  try {
    const { query, cuisine, diet, intolerance, limit } = req.body;

    if (!query) {
      return res.status(400).send({ message: "Missing search query" });
    }

    await userUtils.saveUserSearch(req.user_id, query, cuisine, diet, intolerance, limit || 5);

    res.status(201).send({ message: "Search history saved" });
  } catch (err) {
    console.error("Error saving search history:", err);
    next(err);
  }
});

/** Meal Plan **/

/**
 * Adds a new recipe to the user's meal plan.
 * Supports spoonacular, user recipe, or family recipe (one at a time).
 */
router.post("/meal-plan", async (req, res, next) => {
  try {
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).send({ error: "recipeId is required." });
    }

    await userUtils.addMealPlan(req.user_id, recipeId);

    res.status(200).send({ message: "Recipe added to meal plan." });
  } catch (error) {
    console.error("Error adding to meal plan:", error);
    next(error);
  }
});

/**
 * Retrieves the user's current meal plan entries
 */
router.get("/meal-plan", async (req, res, next) => {
  try {
    const plans = await userUtils.getMealPlan(req.user_id);
    res.status(200).send(plans);
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    next(error);
  }
});

/**
 * Deletes a specific meal plan entry
 */
router.delete("/meal-plan/:planId", async (req, res, next) => {
  try {
    const planId = parseInt(req.params.planId);
    if (isNaN(planId)) {
      return res.status(400).send({ error: "Invalid plan ID" });
    }

    await userUtils.removeMealPlan(planId, req.user_id);
    res.status(200).send({ message: "Meal plan removed successfully" });
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    next(error);
  }
});

/**
 * Deletes all meal plans for the logged-in user
 */
router.delete("/meal-plan", async (req, res, next) => {
  try {
    await userUtils.clearAllMealPlans(req.user_id);
    res.status(200).send({ message: "All meal plans removed." });
  } catch (error) {
    console.error("Error clearing meal plans:", error);
    next(error);
  }
});

/**
 * Gets the number of meal plans for the user
 */
router.get("/meal-plan/count", async (req, res, next) => {
  try {
    const count = await userUtils.getMealPlanCount(req.user_id);
    res.status(200).send({ count });
  } catch (error) {
    console.error("Error getting meal plan count:", error);
    next(error);
  }
});




module.exports = router;
