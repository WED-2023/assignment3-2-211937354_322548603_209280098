const express = require("express");
const router = express.Router();
const verifyLogin = require("./middleware/verifyLogin");
const userUtils = require("../routes/utils/user_utils");

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

router.get("/my-last-watched", async (req, res, next) => {
  try {
    const viewed = await userUtils.getViewedRecipes(req.user_id);
    res.status(200).send(viewed);
  } catch (error) {
    console.error("Error fetching last watched:", error);
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
