const spoonacularConnect = require("./spooncular_connect"); // For API calls
const slices = require("./spooncular_slices"); // For slicing relevant values
const userUtils  = require("../utils/user_utils"); // Optional: to store recipes in DB


/**
 * Fetch N random recipes from Spoonacular and slice each one
 * @param {number} amount - how many random recipes to fetch
 * @returns {Promise<Array>} - array of sliced recipe overviews
 */
async function fetchRandomRecipes(amount = 3) {
    const rawData = await spoonacularConnect.getFromSpoonacular("/random", { number: amount });
    const rawRecipes = rawData.recipes || [];

    // Slice each recipe using overview mode
    const slicedRecipes = rawRecipes.map(slices.sliceRecipeOverview);

    return slicedRecipes;
}


/**
 * Fetch full recipe details from Spoonacular by recipe ID
 * Also records the view in the DB if userId is provided
 *
 * @param {number} recipeId - Spoonacular recipe ID
 * @param {number|null} userId - Logged-in user ID (if available)
 * @returns {Promise<object>} - Sliced full recipe details
 */
async function fetchRecipeById(recipeId, userId = null) {
    const rawRecipe = await spoonacularConnect.getFromSpoonacular(`/${recipeId}/information`);
    const recipeDetails = slices.sliceRecipeDetails(rawRecipe);

    // Record recipe view (into the DB) if user is logged in
    if (userId) {
        await userUtils.addViewedRecipe(userId, {
            spoonacularId: recipeId, // spooncular's recipe ID
            userRecipeId: null,
            familyRecipeId: null
        });
    }

    return recipeDetails;
}


/**
 * Search for recipes using Spoonacular API with filters.
 * Also records the search in DB if userId is provided.
 *
 * @param {object} searchCriteria - Filters: query, cuisine, diet, intolerances, etc.
 * @param {number|null} userId - Logged-in user ID (optional)
 * @returns {Promise<Array>} - Array of sliced recipe overviews
 */
async function fetchRecipesBySearch(searchCriteria, userId = null) {
    const data = await spoonacularConnect.getFromSpoonacular("/complexSearch", searchCriteria);
    const rawRecipes = data.results || [];

    const sliced = rawRecipes.map(slices.sliceRecipeOverview);

    // Save search history if user is logged in
    if (userId) {
        await userUtils.saveUserSearch(
            userId,
            searchCriteria.query || "",
            searchCriteria.cuisine || null,
            searchCriteria.diet || null,
            searchCriteria.intolerance || null,
            searchCriteria.number|| 5
        );
    }

    return sliced;
}

/**
 * Fetch recipe instructions (steps only) by recipe ID from Spoonacular
 *
 * @param {number} recipeId - Spoonacular recipe ID
 * @returns {Promise<Array>} - Array of instruction steps
 */
async function fetchRecipeInstructions(recipeId) {
    const rawRecipe = await spoonacularConnect.getFromSpoonacular(`/${recipeId}/information`);

    const steps = slices.sliceAnalyzedInstructions(rawRecipe);

    return steps;
}



module.exports = {
    fetchRecipeInstructions, // no needed to be used right now, but maybe in the future
    fetchRandomRecipes,
    fetchRecipeById,
    fetchRecipesBySearch
};