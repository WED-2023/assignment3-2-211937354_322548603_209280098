/**
 * Slice down the recipe overview returned from Spoonacular
 * Used for: search results, random recipes
 */
function sliceRecipeOverview(recipe) {
    return {
        id: recipe.id, // Spoonacular recipe ID
        title: recipe.title, // Name of the recipe
        image: recipe.image, // Image URL
        readyInMinutes: recipe.readyInMinutes, // Duration
        popularity: recipe.aggregateLikes || 0, // Popularity score
        vegan: recipe.vegan, // Boolean
        vegetarian: recipe.vegetarian, // Boolean
        glutenFree: recipe.glutenFree // Boolean
    };
}

/**
 * Slice full recipe details for single recipe fetch
 * Used when viewing a full recipe page
 */
function sliceRecipeDetails(recipe) {
    return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        summary: recipe.summary,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        instructions: recipe.instructions,
        popularity: recipe.aggregateLikes || 0,
        vegan: recipe.vegan,
        vegetarian: recipe.vegetarian,
        glutenFree: recipe.glutenFree
    };
}
/**
 * Slices analyzed instructions from raw API data.
 * Removes internal fields and retains only what's needed for display.
 *
 * Output format aligns with internal DB:
 * [{ number: 1, step: "Do something" }, ...]
 *
 * @param {Array} rawInstructions
 * @returns {Array} - Cleaned and standardized step list
 */
function sliceAnalyzedInstructions(rawInstructions) {
    if (!Array.isArray(rawInstructions) || rawInstructions.length === 0) return [];

    const mainBlock = rawInstructions[0]; // Use only the first block of instructions
    if (!mainBlock || !Array.isArray(mainBlock.steps)) return [];

    return mainBlock.steps.map(step => ({
        number: step.number,
        step: step.step
    }));
}



module.exports = {
    sliceRecipeOverview,
    sliceRecipeDetails,
    sliceAnalyzedInstructions
};
