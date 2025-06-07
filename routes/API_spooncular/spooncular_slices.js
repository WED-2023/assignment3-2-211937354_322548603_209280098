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
 * Extract step-by-step instructions only
 * Used in: GET /instructions endpoint
 */
function sliceAnalyzedInstructions(instructionsArray) {
    const steps = instructionsArray?.[0]?.steps || [];
    return steps.map(step => ({
        stepNumber: step.number, // Step number (1-based)
        stepDescription: step.step // Instruction text
    }));
}

module.exports = {
    sliceRecipeOverview,
    sliceRecipeDetails,
    sliceAnalyzedInstructions
};
