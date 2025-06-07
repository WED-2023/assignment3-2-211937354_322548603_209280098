const recipesUtils = require("./recipes_utils");
const favoritesDB = require("/sql_scripts/data_access/user_favorites_db");
const viewsDB = require("/sql_scripts/data_access/recipe_views_db");
const searchHistoryDB  = require("/sql_scripts/data_access/search_history_db");
const mealPlanDB = require("/sql_scripts/data_access/meal_plans_db");

/** In Remote Server Replace lines 2-5 with :
const favoritesDB = require("../../sql_scripts/data_access/user_favorites_db");
const viewsDB = require("../../sql_scripts/data_access/recipe_views_db");
const searchHistoryDB  = require("../../sql_scripts/data_access/search_history_db");
const mealPlanDB = require("../../sql_scripts/data_access/meal_plans_db");
**/

const recipeCombiner = require("../recipes_combined_utils");




/**
 * Adds a recipe to user's favorites, if not already added
 */
async function addFavoriteRecipe(userId, recipeId) {
    const currentFavorites = await favoritesDB.getFavoritesByUserId(userId);
    if (!currentFavorites.some(fav => fav.spoonacular_recipe_id === recipeId)) {
        await favoritesDB.addFavorite(userId, recipeId);
    }
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
    const rawFavorites = await favoritesDB.getFavoritesByUserId(userId);
    return await recipeCombiner.enrichRecipesFromDB(rawFavorites, "source", "spoonacular_recipe_id", userId);
}

/**
 * Adds a view log for a recipe and increases popularity score if it's a local recipe
 */
async function addViewedRecipe(userId, { spoonacularId = null, userRecipeId = null, familyRecipeId = null }) {
    await viewsDB.addRecipeView(userId, { spoonacularId, userRecipeId, familyRecipeId });

    // Increase popularity only for local user-created recipes
    if (userRecipeId) {
        await recipesUtils. incrementUserRecipePopularity(userRecipeId);
    }
}


/**
 * Returns last 3 viewed recipes with full details
 */
async function getViewedRecipes(userId) {
    const rawViews = await viewsDB.getViewsByUserId(userId);
    return await recipeCombiner.enrichRecipesFromDB(rawViews, "source", "recipe_id", userId);
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
 * Only one recipe type (spoonacular, user, or family) should be defined.
 * The function automatically sets the correct order for the new item.
 */
async function addMealPlan(userId, { spoonacularId = null, userRecipeId = null, familyRecipeId = null }) {
    // Step 1: Fetch current count of meal plan entries for the user
    const currentPlans = await mealPlanDB.getMealPlansByUserId(userId);
    const nextOrder = currentPlans.length + 1;

    // Step 2: Insert new plan at the next order
    await mealPlanDB.addMealPlan(userId, spoonacularId, userRecipeId, familyRecipeId, nextOrder);
}

/**
 * Retrieves all meal plan entries for the user with full recipe details
 */
async function getMealPlan(userId) {
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
