const favoritesDB = require("../../sql_scripts/data_access/user_favorites_db");
const viewsDB = require("../../sql_scripts/data_access/recipe_views_db");
const searchHistoryDB  = require("../../sql_scripts/data_access/search_history_db");
const mealPlanDB = require("../../sql_scripts/data_access/meal_plans_db");

/** In Remote Server Replace lines 2-5 with :
const favoritesDB = require("../../sql_scripts/data_access/user_favorites_db");
const viewsDB = require("../../sql_scripts/data_access/recipe_views_db");
const searchHistoryDB  = require("../../sql_scripts/data_access/search_history_db");
const mealPlanDB = require("../../sql_scripts/data_access/meal_plans_db");
**/





/**
 * Adds a Spoonacular recipe to the user's favorites list – only if not already added.
 *
 * Notes:
 * - This function supports **Spoonacular recipes only** (not personal or family recipes).
 * - The recipe is saved under `source = "spoonacular"` in the `user_favorites` table.
 * - Used for enabling personalized "Favorites" view in the frontend.
 *
 * @param {number} userId - ID of the user performing the action
 * @param {number} recipeId - Spoonacular recipe ID to be favorited
 */

async function addFavoriteRecipe(userId, recipeId) {
    const currentFavorites = await favoritesDB.getFavoritesByUserId(userId);
    if (currentFavorites.some(fav => fav.spoonacular_recipe_id === recipeId)) return;

    await favoritesDB.addFavorite(userId, recipeId, "spoonacular");
}


/**
 * Removes a recipe from favorites
 */
async function removeFavorite(userId, recipeId) {
    await favoritesDB.deleteFavorite(userId, recipeId);
}

/**
 * Gets all favorite recipes for the user with full details
 */
async function getFavoriteRecipes(userId) {
    const recipeCombiner = require("../recipes_combined_utils");
    const rawFavorites = await favoritesDB.getFavoritesByUserId(userId);
    return await recipeCombiner.enrichRecipesFromDB(rawFavorites, "source", "recipe_id", userId);
}

/**
 * Adds a view log for a recipe and increases popularity score if it's a local recipe
 */
async function addViewedRecipe(userId, { spoonacularId = null, userRecipeId = null, familyRecipeId = null }) {
    const recipesUtils = require("./recipes_utils");
    await viewsDB.addRecipeView(userId, { spoonacularId, userRecipeId, familyRecipeId });

    // Increase popularity only for local user-created recipes
    if (userRecipeId) {
        await recipesUtils. incrementUserRecipePopularity(userRecipeId);
    }
}


/**
 * Returns the last 3 viewed recipes for the user, with full details.
 *
 * Note:
 * - This includes only recipes from the external Spoonacular API.
 * - The system assumes all entries in the 'recipe_views' table are Spoonacular-based.
 * - Each view is enriched with full recipe data using the Spoonacular recipe ID.
 */

async function getViewedRecipes(userId) {
    const recipeCombiner = require("../recipes_combined_utils");
    const rawViews = await viewsDB.getViewsByUserId(userId);

    // Filter only spoonacular-based views and map them to expected structure
    const enriched = rawViews
        .filter(view => view.spoonacular_recipe_id !== null)
        .map(view => ({
            recipe_id: view.spoonacular_recipe_id,
            source: "spoonacular"
        }));

    return await recipeCombiner.enrichRecipesFromDB(enriched, "source", "recipe_id", userId);
}


/**
 * Deletes all view records for a specific user
 */
async function clearViewedHistory(userId) {
    await viewsDB.deleteViewsByUserId(userId);
}



/**
 * Logs the user's latest search (replaces previous one)
 */
async function saveUserSearch(userId, searchQuery, cuisine, diet, intolerance, limit = 5) {
    await searchHistoryDB.addSearchEntry(userId, searchQuery, cuisine, diet, intolerance, limit);
}

/**
 * Retrieves the most recent search performed by the user
 */
async function getLastSearchQuery(userId) {
    return await searchHistoryDB.getSearchHistoryByUser(userId);
}


/**
 * Adds a new recipe to the user's meal plan.
 * The function detects the recipe source (spoonacular / user / family),
 * calculates its order, and inserts it into the DB.
 */
async function addMealPlan(userId, recipeId) {
    const recipesUtils = require("./recipes_utils");
    const currentPlans = await mealPlanDB.getMealPlansByUserId(userId);
    const nextOrder = currentPlans.length + 1;

    // Detect source
    let source = "spoonacular";
    const userRecipes = await recipesUtils.getAllUserRecipes(userId);
    if (userRecipes.some(r => r.recipe_id === recipeId)) {
        source = "user";
    } else {
        const familyRecipes = await recipesUtils.getFamilyRecipesByUserId(userId);
        if (familyRecipes.some(r => r.recipe_id === recipeId)) {
            source = "family";
        }
    }

    // Save to DB
    await mealPlanDB.addMealPlan(userId, recipeId, source, nextOrder);
}


/**
 * Retrieves all meal plan entries for the user with full recipe details
 */
async function getMealPlan(userId) {
    const recipeCombiner = require("../recipes_combined_utils");
    const rawPlan = await mealPlanDB.getMealPlansByUserId(userId);
    return await recipeCombiner.enrichRecipesFromDB(rawPlan, "source", "recipe_id", userId);
}


/**
 * Removes a meal plan entry by its ID and updates the order of the rest
 */
async function removeMealPlan(planId, userId) {
    await mealPlanDB.deleteMealPlanById(planId, userId);
}

/**
 * Removes all meal plan entries for a given user
 */
async function clearAllMealPlans(userId) {
    await mealPlanDB.deleteMealPlansByUserId(userId);
}
/**
 * Retrieves the count of meal plans a user has
 */
async function getMealPlanCount(userId) {
    return await mealPlanDB.getMealPlanCount(userId);
}



module.exports = {
    getMealPlanCount,
    clearAllMealPlans,
    removeMealPlan,
    getMealPlan,
    getLastSearchQuery,
    clearViewedHistory,
    addFavoriteRecipe,
    removeFavorite,
    getFavoriteRecipes,
    addViewedRecipe,
    getViewedRecipes,
    saveUserSearch,
    addMealPlan
};
