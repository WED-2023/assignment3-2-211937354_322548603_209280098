const DButils = require('./DButils');
const userRecipesDB = require("/sql scripts/data_access/user_recipes_db");
const familyRecipesDB = require("/sql scripts/data_access/family_recipes_db");
const favoritesDB = require("/sql scripts/data_access/user_favorites_db");
const viewsDB = require("/sql scripts/data_access/recipe_views_db");
const usersDB = require("/sql scripts/data_access/user_db");
const searchDB = require("/sql scripts/data_access/search_history_db");
const progressDB = require("/sql scripts/data_access/recipe_preparation_progress_db");
const mealPlanDB = require("/sql scripts/data_access/meal_plans_db");

/**
 * Retrieves all custom recipes created by a user
 */
async function getUserPersonalRecipes(userId) {
    return await userRecipesDB.getUserRecipes(userId);
}

/**
 * Saves a new personal recipe
 */
async function createPersonalRecipe(userId, recipeData) {
    const {
        title, imageUrl, readyInMinutes, popularityScore = 0,
        isVegan, isVegetarian, isGlutenFree,
        servings, summary, instructions
    } = recipeData;

    await userRecipesDB.createUserRecipe(
        userId, title, imageUrl, readyInMinutes, popularityScore,
        isVegan, isVegetarian, isGlutenFree,
        servings, summary, instructions
    );
}

/**
 * Retrieves family recipes added by the user
 */
async function getMyFamilyRecipes(userId) {
    return await familyRecipesDB.getFamilyRecipesByUserId(userId);
}

/**
 * Submits a new family recipe
 */
async function submitFamilyRecipe(userId, recipeData) {
    const {
        title, ownerName, whenToPrepare, imageUrl,
        readyInMinutes, servings, instructions
    } = recipeData;

    await familyRecipesDB.createFamilyRecipe(
        userId, title, ownerName, whenToPrepare,
        imageUrl, readyInMinutes, servings, instructions
    );
}

/**
 * Adds a recipe to user's favorites, if not already added
 */
async function addFavoriteRecipe(userId, recipeId) {
    const currentFavorites = await favoritesDB.getFavoritesByUserId(userId);
    if (!currentFavorites.some(fav => fav.recipe_id == recipeId)) {
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
 * Adds a view log for a recipe and increases popularity score
 */
async function addViewedRecipe(userId, recipeId) {
    await viewsDB.addRecipeView(userId, recipeId);
    await userRecipesDB.incrementPopularity(recipeId); // assumes this function exists
}

/**
 * Returns last 3 viewed recipes
 */
async function getViewedRecipes(userId) {
    return await viewsDB.getRecentViews(userId, 3); // assumes this function exists
}

// /**
//  * Returns full view history (optional)
//  */
// async function getViewHistory(userId) {
//     return await viewsDB.getViewsByUserId(userId);
// }

/**
 * Save user’s search query and result set
 */
async function saveSearchHistory(userId, searchQuery, recipeIds) {
    await searchDB.addSearchRecord(userId, searchQuery, recipeIds.join(","));
}

/**
 * Get recent search history for the user
 */
async function getLastSearches(userId) {
    return await searchDB.getRecentSearches(userId); // assumes implementation
}

/**
 * Save a meal plan for the user
 */
async function saveMealPlan(userId, planData) {
    await mealPlanDB.saveMealPlan(userId, planData);
}

/**
 * Retrieve the saved meal plan
 */
async function getMealPlan(userId) {
    return await mealPlanDB.getMealPlanByUserId(userId);
}

/**
 * Track progress of a specific recipe step
 */
async function updateRecipeProgress(userId, recipeId, stepNumber, status) {
    await progressDB.updateProgress(userId, recipeId, stepNumber, status);
}

/**
 * Get progress of a recipe for the user
 */
async function getRecipeProgress(userId, recipeId) {
    return await progressDB.getUserProgress(userId, recipeId);
}

module.exports = {
    getUserPersonalRecipes,
    createPersonalRecipe,
    getMyFamilyRecipes,
    submitFamilyRecipe,
    addFavoriteRecipe,
    removeFavorite,
    getFavoriteRecipes,
    addViewedRecipe,
    getViewedRecipes,
    getViewHistory,
    saveSearchHistory,
    getLastSearches,
    saveMealPlan,
    getMealPlan,
    updateRecipeProgress,
    getRecipeProgress
};
