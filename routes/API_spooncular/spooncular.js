const express = require("express");
const router = express.Router();
const spoonacularActions = require("./spooncular_actions");

/**
 * GET /spoonacular/random
 * Returns 3 random recipes
 */
router.get("/random", async (req, res, next) => {
    try {
        const recipes = await spoonacularActions.fetchRandomRecipes();
        res.json(recipes);
    } catch (err) {
        console.error("Error fetching random recipes:", err);
        next(err);
    }
});

/**
 * GET /spoonacular/:id
 * Returns detailed info for a specific recipe
 */
router.get("/:id",async (req, res, next) => {
    try {
        const recipeId = req.params.id;
        const userId = req.user?.user_id;
        const recipe = await spoonacularActions.fetchRecipeById(recipeId, userId);
        res.json(recipe);
    } catch (err) {
        console.error("Error fetching recipe by ID:", err);
        next(err);
    }
});

/**
 * GET /spoonacular/search/query
 * Performs a search based on query params (q, cuisine, diet, intolerance, limit)
 */
router.get("/search/query", async (req, res, next) => {
    try {
        const criteria = {
            query: req.query.q || "",
            cuisine: req.query.cuisine || "",
            diet: req.query.diet || "",
            intolerance: req.query.intolerance || "",
            number: req.query.limit || 5
        };

        const userId = req.user?.user_id;
        const results = await spoonacularActions.fetchRecipesBySearch(criteria, userId);
        res.json(results);
    } catch (err) {
        console.error("Error performing recipe search:", err);
        next(err);
    }
});

module.exports = router;
