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
 * Deletes a user's personal recipe, including all related ingredients.
 * Ensures the recipe belongs to the user.
 */
async function deletePersonalRecipe(recipeId, userId) {
    // Step 1: Check recipe ownership using DB-layer check
    const isOwner = await userRecipesDB.isUserRecipeOwner(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized: You can only delete your own recipes.");
        err.status = 403;
        throw err;
    }

    // Step 2: Delete all ingredients associated with the recipe
    await deleteAllIngredientsForRecipe(recipeId);

    // Step 3: Delete the recipe itself
    await userRecipesDB.deleteUserRecipe(recipeId, userId);
}



/**
 * Increments popularity of a user-created recipe
 */
async function incrementUserRecipePopularity(recipeId) {
    await userRecipesDB.incrementPopularity(recipeId);
}

/** Update a full user recipe by ID */
async function updateUserRecipeDetails(recipeId, recipeData, userId) {
    // Ownership check
    const isOwner = await userRecipesDB.isUserRecipeOwner(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized: You can only edit your own recipes.");
        err.status = 403;
        throw err;
    }

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
async function addIngredientToUserRecipe(recipeId, ingredientName, amount, unit, userId) {

    // Validate ownership and existence
    const isOwner = await userRecipesDB.isUserRecipeOwner(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized: You can only modify your own recipes.");
        err.status = 403;
        throw err;
    }

    // Add the ingredient
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
async function getIngredientsByRecipeId(recipeId, userId) {

    // Check ownership
    const isOwner = await userRecipesDB.isUserRecipeOwner(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized: You can only access your own recipes.");
        err.status = 403;
        throw err;
    }

    return await userRecipeIngredientsDB.getIngredientsByRecipeId(recipeId);
}




/**
 * Updates an existing ingredient in a personal recipe by ingredient ID
 */
async function updateIngredient(ingredientId, updatedFields, userId) {
    const isOwner = await userRecipeIngredientsDB.isIngredientOwnedByUser(ingredientId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized: You can only update your own ingredients.");
        err.status = 403;
        throw err;
    }

    await userRecipeIngredientsDB.updateIngredient(ingredientId, updatedFields);
}


/**
 * Deletes a specific ingredient from a personal recipe
 */
async function deleteIngredient(ingredientId, userId) {
    const isOwner = await userRecipeIngredientsDB.isIngredientOwnedByUser(ingredientId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized: You can only delete your own ingredients.");
        err.status = 403;
        throw err;
    }

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
 * Retrieve all family recipes created by a specific user
 */
async function getAllFamilyRecipes(userId) {
    return await familyRecipesDB.getFamilyRecipesByUserId(userId);
}


/**
 * Retrieve a specific family recipe by ID
 */
async function getFamilyRecipeById(recipeId, userId) {
    return await familyRecipesDB.getFamilyRecipeById(recipeId, userId);
}




/**
 * Update a family recipe after validating ownership
 */
async function updateFamilyRecipe(recipeId, updatedFields, userId) {
    const isOwner = await familyRecipesDB.isRecipeOwnedByUser(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized – You can only update your own family recipes.");
        err.status = 403;
        throw err;
    }

    await familyRecipesDB.updateFamilyRecipe(recipeId, updatedFields);
}

/**
 * Delete a family recipe after verifying it belongs to the current user
 */
async function deleteFamilyRecipe(recipeId, userId) {
    const isOwner = await familyRecipesDB.isRecipeOwnedByUser(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized – You can only delete your own family recipes.");
        err.status = 403;
        throw err;
    }

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
 * Gets all ingredients for a specific family recipe (after verifying ownership)
 */
async function getIngredientsByFamilyRecipeId(recipeId, userId) {
    const isOwner = await familyRecipesDB.isRecipeOwnedByUser(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized – You can only access your own family recipes.");
        err.status = 403;
        throw err;
    }

    return await familyRecipeIngredientsDB.getIngredientsByFamilyRecipeId(recipeId);
}




/**
 * Updates an existing ingredient in a family recipe by ingredient ID,
 * after verifying that the ingredient exists and belongs to a recipe owned by the user.
 */
async function updateFamilyIngredientById(recipeId, ingredientId, ingredientName, amount, unit, userId) {
    const isOwner = await familyRecipesDB.isRecipeOwnedByUser(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized – You can only modify your own family recipes.");
        err.status = 403;
        throw err;
    }

    const ingredientExists = await familyRecipeIngredientsDB.isIngredientInRecipe(recipeId, ingredientId);
    if (!ingredientExists) {
        const err = new Error("Ingredient not found in this recipe.");
        err.status = 404;
        throw err;
    }

    await familyRecipeIngredientsDB.updateFamilyIngredientById(ingredientId, ingredientName, amount, unit);
}



/**
 * Deletes a specific ingredient from a family recipe,
 * only if the ingredient belongs to a recipe owned by the user.
 */
async function deleteFamilyIngredient(ingredientId, recipeId, userId) {
    const isOwner = await familyRecipesDB.isRecipeOwnedByUser(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized – You can only modify your own family recipes.");
        err.status = 403;
        throw err;
    }

    const ingredientExists = await familyRecipeIngredientsDB.isIngredientInRecipe(recipeId, ingredientId);
    if (!ingredientExists) {
        const err = new Error("Can't delete a non-existent ingredient in this recipe.");
        err.status = 403;
        throw err;
    }

    await familyRecipeIngredientsDB.deleteIngredientById(ingredientId);
}



/**
 * Adds a new preparation step to a recipe (user or family)
 */
async function addPreparationStepToRecipe(userRecipeId, familyRecipeId, stepNumber, stepDescription, userId) {
    const hasUserRecipe = !!userRecipeId;
    const hasFamilyRecipe = !!familyRecipeId;

    if ((hasUserRecipe && hasFamilyRecipe) || (!hasUserRecipe && !hasFamilyRecipe)) {
        const err = new Error("Exactly one of userRecipeId or familyRecipeId must be provided.");
        err.status = 400;
        throw err;
    }

    if (hasUserRecipe) {
        const userRecipes = await userRecipesDB.getUserRecipes(userId);
        const ownsRecipe = userRecipes.some(r => r.recipe_id === userRecipeId);
        if (!ownsRecipe) {
            const err = new Error("Unauthorized – You don't own this user recipe.");
            err.status = 403;
            throw err;
        }
    } else {
        const isOwner = await familyRecipesDB.isRecipeOwnedByUser(familyRecipeId, userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You don't own this family recipe.");
            err.status = 403;
            throw err;
        }
    }

    await recipeStepsDB.addPreparationStep(userRecipeId, familyRecipeId, stepNumber, stepDescription);
}


/**
 * Retrieve all preparation steps for a given recipe (user or family),
 * after verifying the user owns the recipe.
 */
async function getPreparationSteps(userRecipeId, familyRecipeId, userId) {
    const hasUserRecipe = !!userRecipeId;
    const hasFamilyRecipe = !!familyRecipeId;

    if ((hasUserRecipe && hasFamilyRecipe) || (!hasUserRecipe && !hasFamilyRecipe)) {
        const err = new Error("Exactly one of userRecipeId or familyRecipeId must be provided.");
        err.status = 400;
        throw err;
    }

    if (hasUserRecipe) {
        const userRecipes = await userRecipesDB.getUserRecipes(userId);
        const owns = userRecipes.some(r => r.recipe_id === parseInt(userRecipeId));
        if (!owns) {
            const err = new Error("Unauthorized – You don't own this user recipe.");
            err.status = 403;
            throw err;
        }
    } else {
        const isOwner = await familyRecipesDB.isRecipeOwnedByUser(parseInt(familyRecipeId), userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You don't own this family recipe.");
            err.status = 403;
            throw err;
        }
    }

    return await recipeStepsDB.getStepsByRecipeId(userRecipeId, familyRecipeId);
}


/**
 * Updates the description of a preparation step,
 * only if the step exists and belongs to the user's recipe.
 */
async function updatePreparationStep(stepId, newDescription, userId) {
    const stepData = await recipeStepsDB.getStepById(stepId);
    if (!stepData) {
        const err = new Error("Step not found.");
        err.status = 404;
        throw err;
    }

    const { user_recipe_id, family_recipe_id } = stepData;

    if (user_recipe_id) {
        const userRecipes = await userRecipesDB.getUserRecipes(userId);
        const owns = userRecipes.some(r => r.recipe_id === user_recipe_id);
        if (!owns) {
            const err = new Error("Unauthorized – You don't own this step.");
            err.status = 403;
            throw err;
        }
    } else if (family_recipe_id) {
        const isOwner = await familyRecipesDB.isRecipeOwnedByUser(family_recipe_id, userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You don't own this step.");
            err.status = 403;
            throw err;
        }
    } else {
        // data corruption case
        const err = new Error("Invalid step – missing recipe reference.");
        err.status = 500;
        throw err;
    }

    await recipeStepsDB.updateStepDescription(stepId, newDescription);
}




/**
 * Deletes a single preparation step by step ID,
 * after verifying that the step belongs to a recipe owned by the user.
 */
async function deletePreparationStep(stepId, userId) {
    const step = await recipeStepsDB.getStepById(stepId);
    if (!step) {
        const err = new Error("Step not found.");
        err.status = 404;
        throw err;
    }

    if (step.user_recipe_id) {
        const isOwner = await userRecipesDB.isUserRecipeOwner(step.user_recipe_id, userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You can only delete your own recipe steps.");
            err.status = 403;
            throw err;
        }
    } else if (step.family_recipe_id) {
        const isOwner = await familyRecipesDB.isRecipeOwnedByUser(step.family_recipe_id, userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You can only delete your own family recipe steps.");
            err.status = 403;
            throw err;
        }
    } else {
        throw new Error("Invalid step: missing recipe association.");
    }

    // שלב 3: מחיקה
    await recipeStepsDB.deleteStepById(stepId);
}

/**
 * Delete all steps associated with a specific recipe,
 * after verifying that the recipe belongs to the requesting user.
 */
async function deleteAllStepsForRecipe(userRecipeId, familyRecipeId, userId) {
    if (userRecipeId) {
        const isOwner = await userRecipesDB.isUserRecipeOwner(userRecipeId, userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You can only delete your own recipe steps.");
            err.status = 403;
            throw err;
        }
    } else if (familyRecipeId) {
        const isOwner = await familyRecipesDB.isRecipeOwnedByUser(familyRecipeId, userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You can only delete your own family recipe steps.");
            err.status = 403;
            throw err;
        }
    }

    await recipeStepsDB.deleteAllStepsByRecipe(userRecipeId, familyRecipeId);
}

/**
 * Adds a new progress entry for a preparation step (of any recipe type)
 */
async function addPreparationStepProgress(userId, spoonacularId, userRecipeId, familyRecipeId, stepNumber) {
    if (userRecipeId) {
        const isOwner = await userRecipesDB.isUserRecipeOwner(userRecipeId, userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You can only track progress for your own personal recipes.");
            err.status = 403;
            throw err;
        }
    } else if (familyRecipeId) {
        const isOwner = await familyRecipesDB.isRecipeOwnedByUser(familyRecipeId, userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You can only track progress for your own family recipes.");
            err.status = 403;
            throw err;
        }
    }

    // No check needed for spoonacular (public)
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


