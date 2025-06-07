const recipesUtils = require("./utils/recipes_utils");
const spooncularActions =  require("./API_spooncular/spooncular_actions");



/**
 * Given an array of recipe identifiers, fetch full details from appropriate sources
 * Supports Spoonacular, user-created, and family recipes.
 *
 * @param {Array} recipes - Array of objects with source & id, e.g.:
 *   [{ source: 'spoonacular', id: 123 }, { source: 'user', id: 45 }]
 * @param {string} userId - Current user's ID, if needed for access validation
 * @returns {Promise<Array>} Array of full recipe detail objects
 */
async function getMultipleRecipeDetails(recipes, userId) {
    const results = [];

    for (const recipe of recipes) {
        try {
            switch (recipe.source) {
                case "spoonacular":
                    const raw = await spooncularActions.fetchRecipeById(recipe.id, userId);
                    results.push(raw);
                    break;

                case "user":
                    // Assuming you have a way to get one user's recipe by ID
                    const allUserRecipes = await recipesUtils.getAllUserRecipes(userId);
                    const userRecipe = allUserRecipes.find(r => r.id === recipe.id);
                    if (userRecipe) results.push(userRecipe);
                    break;

                case "family":
                    const familyRecipe = await recipesUtils.getFamilyRecipeById(recipe.id);
                    if (familyRecipe) results.push(familyRecipe);
                    break;

                default:
                    console.warn("Unknown recipe source:", recipe.source);
            }
        } catch (err) {
            console.error(`Failed to fetch recipe ${recipe.id} from ${recipe.source}:`, err);
        }
    }

    return results;
}




/**
 * Enhances a raw array of recipe records from DB with full recipe details,
 * using the appropriate source (spoonacular, user, or family).
 *
 * @param {Array} rawRecipes - Array of DB rows, each containing a recipe ID and source field.
 * @param {string} sourceKey - The name of the property in each row that indicates the source.
 * @param {string} idKey - The name of the property in each row that contains the recipe ID.
 * @param {string} userId - The current user's ID
 * @returns {Promise<Array>} - Array of full recipe details
 */
async function enrichRecipesFromDB(rawRecipes, sourceKey, idKey, userId) {
    if (!rawRecipes || rawRecipes.length === 0) return [];

    const mapped = rawRecipes.map(row => ({
        id: row[idKey],
        source: row[sourceKey]
    }));

    return await getMultipleRecipeDetails(mapped, userId);
}



module.exports = {
    enrichRecipesFromDB
};
