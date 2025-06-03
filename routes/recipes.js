const express = require("express");
const router = express.Router();
const recipesLogic = require("../routes/utils/recipes_utils");

/**
 * Get 3 random recipes from Spoonacular (just for fun!)
 */
router.get("/random", async (req, res, next) => {
  try {
    const randomRecipes = await recipesLogic.getThreeRandom();
    res.status(200).send(randomRecipes);
  } catch (err) {
    console.error("Problem getting random recipes:", err.message);
    next(err);
  }
});

/**
 * Get full recipe details
 */
router.get("/:id", async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    const userId = req.session?.user_id || null;

    const fullDetails = await recipesLogic.getFullRecipeById(recipeId);

    if (!fullDetails) return res.status(404).send("Recipe not found");

    // mark as viewed by user (if logged in)
    if (userId) {
      await recipesLogic.markRecipeAsViewed(userId, recipeId);
    }

    res.status(200).send(fullDetails);
  } catch (err) {
    console.error("Couldn’t fetch recipe:", err.message);
    next(err);
  }
});

/**
 * Search recipes using filters like query, cuisine, diet...
 */
router.get("/", async (req, res, next) => {
  try {
    const userId = req.session?.user_id || null;

    const { query } = req.query; // save this in history later
    const results = await recipesLogic.searchRecipesWithParams(req.query);

    // save search history if logged in
    if (userId && query) {
      const recipeIds = results.map((r) => r.id);
      await recipesLogic.saveSearchToHistory(userId, query, recipeIds);
    }

    res.status(200).send(results);
  } catch (err) {
    console.error("Search failed:", err.message);
    next(err);
  }
});

/**
 * Like a recipe (either from DB or Spoonacular)
 */
router.post("/:id/like", async (req, res, next) => {
  try {
    const userId = req.session?.user_id || null;
    const result = await recipesLogic.likeRecipe(req.params.id, userId);
    res.status(200).send(result);
  } catch (err) {
    console.error("Error liking recipe:", err.message);
    next(err);
  }
});

/**
 * Save user progress in recipe steps (like: done with step 3!)
 */
router.post("/:id/progress", async (req, res, next) => {
  try {
    const userId = req.session?.user_id;
    if (!userId) return res.status(401).send("Please log in to track progress");

    const { stepNumber, status } = req.body;
    await recipesLogic.updateRecipeStepProgress(userId, req.params.id, stepNumber, status);

    res.status(200).send("Got it! Progress saved :)");
  } catch (err) {
    console.error("Couldn’t save progress:", err.message);
    next(err);
  }
});

/**
 * Get user progress in a recipe (what steps are done?)
 */
router.get("/:id/progress", async (req, res, next) => {
  try {
    const userId = req.session?.user_id;
    if (!userId) return res.status(401).send("Please log in to view progress");

    const progress = await recipesLogic.getRecipeProgressForUser(userId, req.params.id);
    res.status(200).send(progress);
  } catch (err) {
    console.error("Couldn’t fetch progress:", err.message);
    next(err);
  }
});

module.exports = router;
