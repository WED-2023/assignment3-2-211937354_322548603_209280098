const express = require("express");
const router = express.Router();
const DButils = require("../routes/utils/DButils");
const recipesUtils = require("../routes/utils/recipes_utils");
const userUtils = require("../routes/utils/user_utils");

/** Middleware to verify user session */
router.use(async (req, res, next) => {
  if (req.session && req.session.user_id) {
    try {
      const users = await DButils.execQuery("SELECT user_id FROM users");
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      } else {
        res.sendStatus(401);
      }
    } catch (err) {
      next(err);
    }
  } else {
    res.sendStatus(401);
  }
});

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
router.post("/:recipeId/viewed", async (req, res, next) => {
  try {
    await userUtils.addViewedRecipe(req.user_id, req.params.recipeId);
    res.status(200).send({ message: "Marked as viewed. Nice pick!" });
  } catch (error) {
    console.error("Error marking recipe as viewed:", error);
    next(error);
  }
});

router.get("/my-last-watched", async (req, res, next) => {
  try {
    const viewed = await userUtils.getViewedRecipes(req.user_id);
    res.status(200).send(viewed);
  } catch (error) {
    console.error("Error fetching last watched:", error);
    next(error);
  }
});

/** Search history */
router.get("/searchHistory", async (req, res, next) => {
  try {
    const searches = await userUtils.getLastSearches(req.user_id);
    res.status(200).send(searches);
  } catch (error) {
    console.error("Error fetching search history:", error);
    next(error);
  }
});

/** Meal Plan */
router.post("/mealPlan", async (req, res, next) => {
  try {
    await userUtils.saveMealPlan(req.user_id, req.body.mealPlan);
    res.status(200).send({ message: "Meal plan saved. Ready to cook!" });
  } catch (error) {
    console.error("Error saving meal plan:", error);
    next(error);
  }
});

router.get("/mealPlan", async (req, res, next) => {
  try {
    const mealPlan = await userUtils.getMealPlan(req.user_id);
    res.status(200).send(mealPlan);
  } catch (error) {
    console.error("Error fetching meal plan:", error);
    next(error);
  }
});

/** Recipe progress */
router.post("/progress", async (req, res, next) => {
  try {
    const { recipeId, stepNumber, status } = req.body;
    await userUtils.updateRecipeProgress(req.user_id, recipeId, stepNumber, status);
    res.status(200).send({ message: "Progress saved! Keep it up 💪" });
  } catch (error) {
    console.error("Error updating progress:", error);
    next(error);
  }
});

router.get("/progress/:recipeId", async (req, res, next) => {
  try {
    const progress = await userUtils.getRecipeProgress(req.user_id, req.params.recipeId);
    res.status(200).send(progress);
  } catch (error) {
    console.error("Error fetching recipe progress:", error);
    next(error);
  }
});

/** Custom & Family Recipes */
router.post("/myRecipes", async (req, res, next) => {
  try {
    await userUtils.createPersonalRecipe(req.user_id, req.body);
    res.status(201).send({ message: "Your recipe was saved. Yum!" });
  } catch (error) {
    console.error("Error creating personal recipe:", error);
    next(error);
  }
});

router.post("/myFamilyRecipes", async (req, res, next) => {
  try {
    await userUtils.submitFamilyRecipe(req.user_id, req.body);
    res.status(201).send({ message: "Family recipe saved with love 💕" });
  } catch (error) {
    console.error("Error saving family recipe:", error);
    next(error);
  }
});

router.get("/myRecipes", async (req, res, next) => {
  try {
    const recipes = await userUtils.getUserPersonalRecipes(req.user_id);
    res.status(200).send(recipes);
  } catch (error) {
    console.error("Error fetching personal recipes:", error);
    next(error);
  }
});

router.get("/myFamilyRecipes", async (req, res, next) => {
  try {
    const recipes = await userUtils.getMyFamilyRecipes(req.user_id);
    res.status(200).send(recipes);
  } catch (error) {
    console.error("Error fetching family recipes:", error);
    next(error);
  }
});

module.exports = router;
