const userRecipesDB = require("../../sql_scripts/data_access/user_recipes_db");
const userRecipeIngredientsDB = require("../../sql_scripts/data_access/user_recipe_ingredients_db");
const familyRecipesDB = require("../../sql_scripts/data_access/family_recipes_db");
const familyRecipeIngredientsDB = require("../../sql_scripts/data_access/family_recipe_ingredients_db");
const recipeStepsDB = require("../../sql_scripts/data_access/recipe_preparation_steps_db");
const recipeProgressDB = require("../../sql_scripts/data_access/recipe_preparation_progress_db");





/**
 * Add a new personal recipe to the user's collection
 */
async function addPersonalRecipe(userId, recipeData) {
    const {
        title,
        imageUrl,
        readyInMinutes,
        popularityScore,
        isVegan,
        isVegetarian,
        isGlutenFree,
        servings,
        summary,
        instructions,
    } = recipeData;

    await userRecipesDB.createUserRecipe(
        userId,
        title,
        imageUrl,
        readyInMinutes,
        popularityScore,
        isVegan,
        isVegetarian,
        isGlutenFree,
        servings,
        summary,
        instructions
    );
}

/**
 * Retrieve all personal recipes created by a specific user
 */
async function getAllUserRecipes(userId) {
    return await userRecipesDB.getUserRecipes(userId);
}

/**
 * Deletes a personal recipe by ID (and its ingredients)
 */
async function deletePersonalRecipe(recipeId) {
    // delete all ingredients

    await deleteAllIngredientsForRecipe(recipeId);

    // delete the recipe
    await userRecipesDB.deleteUserRecipe(recipeId);
}


/**
 * Increments popularity of a user-created recipe
 */
async function incrementUserRecipePopularity(recipeId) {
    await userRecipesDB.incrementPopularity(recipeId);
}

/** Update a full user recipe by ID */
async function updateUserRecipeDetails(recipeId, recipeData) {
    const {
        title,
        imageUrl,
        readyInMinutes,
        isVegan,
        isVegetarian,
        isGlutenFree,
        servings,
        summary,
        instructions,
    } = recipeData;

    await userRecipesDB.updateUserRecipe(
        recipeId,
        title,
        imageUrl,
        readyInMinutes,
        isVegan,
        isVegetarian,
        isGlutenFree,
        servings,
        summary,
        instructions
    );
}

/**
 * Adds a new ingredient to a specific personal recipe
 */
async function addIngredientToUserRecipe(recipeId, ingredientName, amount, unit) {
    await userRecipeIngredientsDB.addIngredientToUserRecipe(
        recipeId,
        ingredientName,
        amount,
        unit
    );
}

/**
 * Retrieves all ingredients for a user's personal recipe
 */
async function getIngredientsByRecipeId(recipeId) {
    return await userRecipeIngredientsDB.getIngredientsByRecipeId(recipeId);
}


/**
 * Updates an existing ingredient in a personal recipe by ingredient ID
 */
async function updateIngredient(ingredientId, updatedFields) {
    await userRecipeIngredientsDB.updateIngredient(ingredientId, updatedFields);
}

/**
 * Deletes a specific ingredient from a personal recipe
 */
async function deleteIngredient(ingredientId) {
    await userRecipeIngredientsDB.deleteIngredientById(ingredientId);
}

/**
 * Deletes all ingredients for a given personal recipe (used when deleting recipe)
 */
async function deleteAllIngredientsForRecipe(recipeId) {
    await userRecipeIngredientsDB.deleteIngredientsByRecipeId(recipeId);
}

/**
 * Add a new family recipe to the system
 */
async function addFamilyRecipe(userId, recipeData) {
    const {
        title, ownerName, whenToPrepare,
        imageUrl, readyInMinutes, servings, instructions
    } = recipeData;

    await familyRecipesDB.createFamilyRecipe(
        userId,
        title,
        ownerName,
        whenToPrepare,
        imageUrl,
        readyInMinutes,
        servings,
        instructions
    );
}

/**
 * Retrieve all available family recipes
 */
async function getAllFamilyRecipes() {
    return await familyRecipesDB.getAllFamilyRecipes();
}

/**
 * Retrieve a specific family recipe by ID
 */
async function getFamilyRecipeById(recipeId) {
    return await familyRecipesDB.getFamilyRecipeById(recipeId);
}

/**
 * Retrieve all family recipes created by a specific user
 */
async function getFamilyRecipesByUserId(userId) {
    return await familyRecipesDB.getFamilyRecipesByUserId(userId);
}

/**
 * Update a family recipe's details
 */
async function updateFamilyRecipe(recipeId, updatedFields) {
    await familyRecipesDB.updateFamilyRecipe(recipeId, updatedFields);
}
/**
 * Delete a family recipe by ID
 */
async function deleteFamilyRecipe(recipeId) {
    await familyRecipesDB.deleteFamilyRecipeById(recipeId);
}

/**
 * Adds a new ingredient to a family recipe (by recipe ID)
 */
async function addIngredientToFamilyRecipe(recipeId, ingredientName, amount, unit) {
    await familyRecipeIngredientsDB.addIngredientToFamilyRecipe(
        recipeId,
        ingredientName,
        amount,
        unit
    );
}

/**
 * Gets all ingredients for a specific family recipe (by recipe ID)
 */
async function getIngredientsByFamilyRecipeId(recipeId) {
    return await familyRecipeIngredientsDB.getIngredientsByFamilyRecipeId(recipeId);
}




/**
 * Updates an existing ingredient in a family recipe by ingredient ID
 */
async function updateFamilyIngredientById(ingredientId, ingredientName, amount, unit) {
    await familyRecipeIngredientsDB.updateFamilyIngredientById(ingredientId, ingredientName, amount, unit);
}


/**
 * Deletes a specific ingredient from a family recipe
 */
async function deleteFamilyIngredient(ingredientId) {
    await familyRecipeIngredientsDB.deleteIngredientById(ingredientId);
}



/**
 * Adds a new preparation step to a recipe (user or family)
 */
async function addPreparationStepToRecipe(userRecipeId, familyRecipeId, stepNumber, stepDescription) {
    await recipeStepsDB.addPreparationStep(userRecipeId, familyRecipeId, stepNumber, stepDescription);
}

/**
 * Retrieve all preparation steps for a given recipe (user or family)
 */
async function getPreparationSteps(userRecipeId, familyRecipeId) {
    return await recipeStepsDB.getStepsByRecipeId(userRecipeId, familyRecipeId);
}

/**
 * Update the description of a preparation step by step ID
 */
async function updatePreparationStep(stepId, newDescription) {
    await recipeStepsDB.updateStepDescription(stepId, newDescription);
}


/**
 * Delete a single preparation step by step ID
 */
async function deletePreparationStep(stepId) {
    await recipeStepsDB.deleteStepById(stepId);
}

/**
 * Delete all steps associated with a specific recipe
 */
async function deleteAllStepsForRecipe(userRecipeId, familyRecipeId) {
    await recipeStepsDB.deleteAllStepsByRecipe(userRecipeId, familyRecipeId);
}

/**
 * Adds a new progress entry for a preparation step (of any recipe type)
 */
async function addPreparationStepProgress(userId, spoonacularId, userRecipeId, familyRecipeId, stepNumber) {
    await recipeProgressDB.addPreparationStepProgress(
        userId,
        spoonacularId,
        userRecipeId,
        familyRecipeId,
        stepNumber
    );
}

/**
 * Marks a specific preparation step as completed for a user (any recipe type)
 */
async function completePreparationStep(userId, spoonacularId, userRecipeId, familyRecipeId, stepNumber) {
    await recipeProgressDB.completeStep(
        userId,
        spoonacularId,
        userRecipeId,
        familyRecipeId,
        stepNumber
    );
}

/**
 * Marks a preparation step as uncompleted for a user (resets completion state)
 */
async function uncompletePreparationStep(userId, spoonacularId, userRecipeId, familyRecipeId, stepNumber) {
    await recipeProgressDB.uncompleteStep(
        userId,
        spoonacularId,
        userRecipeId,
        familyRecipeId,
        stepNumber
    );
}

/**
 * Retrieves preparation progress for a specific recipe and user
 */
async function getRecipeProgress(userId, spoonacularId, userRecipeId, familyRecipeId) {
    return await recipeProgressDB.getProgressForRecipe(
        userId,
        spoonacularId,
        userRecipeId,
        familyRecipeId
    );
}


/**
 * Resets the progress tracking for a specific recipe and user
 */
async function resetRecipeProgress(userId, spoonacularId, userRecipeId, familyRecipeId) {
    await recipeProgressDB.deleteProgressForRecipe(
        userId,
        spoonacularId,
        userRecipeId,
        familyRecipeId
    );
}


module.exports = {
    resetRecipeProgress,
    getRecipeProgress,
    uncompletePreparationStep,
    completePreparationStep,
    addPreparationStepProgress,
    deletePreparationStep,
    deleteAllStepsForRecipe,
    updatePreparationStep,
    getPreparationSteps,
    addPreparationStepToRecipe,
    deleteFamilyIngredient,
    updateFamilyIngredientById,
    getIngredientsByFamilyRecipeId,
    addIngredientToFamilyRecipe,
    deleteFamilyRecipe,
    updateFamilyRecipe,
    getFamilyRecipesByUserId,
    getFamilyRecipeById,
    getAllFamilyRecipes,
    addFamilyRecipe,
    deleteIngredient,
    updateIngredient,
    getIngredientsByRecipeId,
    addIngredientToUserRecipe,
    updateUserRecipeDetails,
    incrementUserRecipePopularity,
    addPersonalRecipe,
    getAllUserRecipes,
    deletePersonalRecipe
};


