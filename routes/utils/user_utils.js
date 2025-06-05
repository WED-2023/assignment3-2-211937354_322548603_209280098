const recipesUtils = require("./recipes_utils");
const favoritesDB = require("/sql scripts/data_access/user_favorites_db");
const viewsDB = require("/sql scripts/data_access/recipe_views_db");
const searchHistoryDB  = require("/sql scripts/data_access/search_history_db");
const mealPlanDB = require("/sql scripts/data_access/meal_plans_db");



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
 * Gets all favorite recipes for the user
 */
async function getFavoriteRecipes(userId) {
    return await favoritesDB.getFavoritesByUserId(userId);
}

/**
 * Adds a view log for a recipe and increases popularity score if it's a local recipe
 */
async function addViewedRecipe(userId, { spoonacularId = null, userRecipeId = null, familyRecipeId = null }) {
    await viewsDB.addRecipeView(userId, { spoonacularId, userRecipeId, familyRecipeId });

    // Increase popularity only for local user-created recipes
    if (userRecipeId) {
        await recipesUtils.incrementUserRecipePopularity(userRecipeId);
    }
}


/**
 * Returns last 3 viewed recipes
 */
async function getViewedRecipes(userId) {
    return await viewsDB.getViewsByUserId(userId);
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
 * Retrieves all meal plan entries for the user
 */
async function getMealPlan(userId) {
    return await mealPlanDB.getMealPlansByUserId(userId);
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
