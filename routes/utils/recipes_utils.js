const userRecipesDB = require("../../sql_scripts/data_access/user_recipes_db");
const userRecipeIngredientsDB = require("../../sql_scripts/data_access/user_recipe_ingredients_db");
const familyRecipesDB = require("../../sql_scripts/data_access/family_recipes_db");
const familyRecipeIngredientsDB = require("../../sql_scripts/data_access/family_recipe_ingredients_db");
const recipeStepsDB = require("../../sql_scripts/data_access/recipe_preparation_steps_db");
const recipeProgressDB = require("../../sql_scripts/data_access/recipe_preparation_progress_db");





/**
 * Creates a new personal (user-owned) recipe, including its ingredients and preparation steps.
 *
 * This function receives a structured recipe object from the user, validates its content,
 * inserts the main recipe into the `user_recipes` table, then iteratively inserts:
 * - all ingredients into `user_recipe_ingredients`
 * - all preparation steps into `recipe_preparation_steps` (as a user recipe, not family)
 * - and for each preparation step, initializes a corresponding `recipe_preparation_progress` entry
 *   with `is_completed = false` for tracking real-time cooking progress.
 *
 * Throws an error if validation fails on required fields.
 *
 * @param {number} userId - The ID of the user creating the recipe
 * @param {object} recipeData - The full recipe data, including metadata, ingredients, and steps
 * @returns {number} The ID of the newly created recipe
 */
async function addPersonalRecipe(userId, recipeData) {
    const {
        title, imageUrl, readyInMinutes, isVegan, isVegetarian,
        isGlutenFree, servings, summary, instructions,
        ingredients, preparationSteps
    } = recipeData;

    // Validate ingredients
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        throw new Error("At least one ingredient is required.");
    }
    for (const ing of ingredients) {
        if (!ing.ingredientName || ing.amount == null || !ing.unit)
            throw new Error("Each ingredient must include name, amount, and unit.");
    }

    // Validate preparation steps
    if (!Array.isArray(preparationSteps) || preparationSteps.length === 0) {
        throw new Error("At least one preparation step is required.");
    }
    for (const step of preparationSteps) {
        if (typeof step.stepNumber !== "number" || !step.stepDescription) {
            throw new Error("Each step must include a numeric stepNumber and a stepDescription.");
        }
    }

    // Insert recipe into user_recipes
    const recipeId = await userRecipesDB.createUserRecipe(
        userId, title, imageUrl, readyInMinutes, 0,
        isVegan, isVegetarian, isGlutenFree, servings, summary, instructions
    );

    // Insert ingredients into user_recipe_ingredients
    for (const ing of ingredients) {
        await userRecipeIngredientsDB.addIngredientToUserRecipe(
            recipeId, ing.ingredientName, ing.amount, ing.unit
        );
    }

    // Insert preparation steps into recipe_preparation_steps
    for (const step of preparationSteps) {
        await recipeStepsDB.addPreparationStep(
            recipeId,     // user_recipe_id
            null,         // family_recipe_id
            step.stepNumber,
            step.stepDescription
        );

        // Also initialize corresponding progress record for this step
        await recipeProgressDB.addPreparationStepProgress({
            userId,
            spoonacularRecipeId: null,
            userRecipeId: recipeId,
            familyRecipeId: null,
            stepNumber: step.stepNumber
        });
    }

    return recipeId;
}



/**
 * Retrieve all personal recipes created by a specific user
 */
async function getAllUserRecipes(userId) {
    return await userRecipesDB.getUserRecipes(userId);
}

/**
 * Deletes a user's personal recipe, including all related ingredients, steps, and progress.
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

    // Step 2: Delete all ingredients and preparation steps associated with the recipe
    await deleteAllIngredientsForUserRecipe(recipeId);
    await deleteAllStepsForRecipe(recipeId, null, userId);

    // Step 3: Delete all real-time progress records for this recipe
    await deleteAllProgressForUserRecipe(recipeId, userId);

    // Step 4: Delete the recipe itself
    await userRecipesDB.deleteUserRecipe(recipeId, userId);
}

/**
 * Deletes all progress rows for a given user and user recipe (if any).
 */
async function deleteAllProgressForUserRecipe(userRecipeId, userId) {
    await recipeProgressDB.deleteProgressForRecipe(userId, null, userRecipeId, null);
}


/**
 * Updates fields of a personal recipe.
 *
 * Supports partial updates – user may send only the fields to be changed.
 * Ignores fields that are null, undefined, or empty strings.
 * At least one valid field must be provided, or the update will be rejected.
 * Also validates ownership of the recipe.
 *
 */
async function updateUserRecipeDetails(recipeId, recipeData, userId) {
    // Ownership check
    const isOwner = await userRecipesDB.isUserRecipeOwner(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized: You can only edit your own recipes.");
        err.status = 403;
        throw err;
    }

    // Filter out empty/null/undefined fields
    const cleanFields = {};
    for (const [key, value] of Object.entries(recipeData)) {
        if (value !== null && value !== undefined && value !== "") {
            cleanFields[key] = value;
        }
    }

    if (Object.keys(cleanFields).length === 0) {
        const err = new Error("At least one valid field must be provided for update.");
        err.status = 400;
        throw err;
    }

    await userRecipesDB.updateUserRecipe(recipeId, cleanFields);
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
 * Updates an existing ingredient in a specific personal recipe by ingredient ID.
 *
 * This function supports **partial updates** – the user can send only the fields they wish to change.
 * Fields with null, undefined, or empty string values will be ignored.
 * At least one valid field must be provided, or the request will be rejected.
 * Verifies both ingredient ownership and recipe association.
 */
async function updateIngredient(recipeId, ingredientId, updatedFields, userId) {
    const isOwner = await userRecipeIngredientsDB.isIngredientOwnedByUser(ingredientId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized: You can only update your own ingredients.");
        err.status = 403;
        throw err;
    }

    // Ensure the ingredient belongs to the recipe in context
    const actualRecipeId = await userRecipeIngredientsDB.getRecipeIdByIngredientId(ingredientId);
    if (parseInt(actualRecipeId) !== parseInt(recipeId)) {
        const err = new Error("Ingredient does not belong to the specified recipe.");
        err.status = 400;
        throw err;
    }

    // Filter nullish or empty fields
    const cleanFields = {};
    for (const [key, value] of Object.entries(updatedFields)) {
        if (value !== null && value !== undefined && value !== "") {
            cleanFields[key] = value;
        }
    }

    if (Object.keys(cleanFields).length === 0) {
        const err = new Error("At least one valid field must be provided for update.");
        err.status = 400;
        throw err;
    }

    await userRecipeIngredientsDB.updateIngredient(ingredientId, cleanFields);
}



/**
 * Deletes a specific ingredient from a personal recipe.
 * Ensures:
 * - Ingredient belongs to the user
 * - Ingredient belongs to the recipe
 * - At least one ingredient remains in the recipe
 */
async function deleteIngredient(recipeId, ingredientId, userId) {
    const isOwner = await userRecipeIngredientsDB.isIngredientOwnedByUser(ingredientId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized: You can only delete your own ingredients.");
        err.status = 403;
        throw err;
    }

    // Ensure the ingredient belongs to the recipe
    const actualRecipeId = await userRecipeIngredientsDB.getRecipeIdByIngredientId(ingredientId);
    if (parseInt(actualRecipeId) !== parseInt(recipeId)) {
        const err = new Error("Ingredient does not belong to the specified recipe.");
        err.status = 400;
        throw err;
    }

    // Count remaining ingredients in the recipe
    const ingredientCount = await userRecipeIngredientsDB.countIngredientsByRecipeId(recipeId);
    if (ingredientCount <= 1) {
        const err = new Error("Cannot delete the last ingredient. A recipe must have at least one ingredient.");
        err.status = 400;
        throw err;
    }

    await userRecipeIngredientsDB.deleteIngredientById(ingredientId);
}



/**
 * Deletes all ingredients for a given personal recipe (used when deleting recipe)
 */
async function deleteAllIngredientsForUserRecipe(recipeId) {
    await userRecipeIngredientsDB.deleteIngredientsByRecipeId(recipeId);
}
/**
 * Add a new family recipe to the system.
 * Validates content, inserts recipe, ingredients, preparation steps, and matching progress rows.
 */
async function addFamilyRecipe(userId, recipeData) {
    const {
        title, ownerName, whenToPrepare,
        imageUrl, readyInMinutes, servings, instructions,
        ingredients, preparationSteps
    } = recipeData;

    // Validate ingredients
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        throw new Error("At least one ingredient is required.");
    }
    for (const ing of ingredients) {
        if (!ing.ingredientName || ing.amount == null || !ing.unit) {
            throw new Error("Each ingredient must include name, amount, and unit.");
        }
    }

    // Validate preparation steps
    if (!Array.isArray(preparationSteps) || preparationSteps.length === 0) {
        throw new Error("At least one preparation step is required.");
    }
    for (const step of preparationSteps) {
        if (typeof step.stepNumber !== "number" || !step.stepDescription) {
            throw new Error("Each step must include a numeric stepNumber and a stepDescription.");
        }
    }

    // Insert recipe into family_recipes
    const recipeId = await familyRecipesDB.createFamilyRecipe(
        userId, title, ownerName, whenToPrepare, imageUrl, readyInMinutes, servings, instructions
    );

    // Insert ingredients into family_recipe_ingredients
    for (const ing of ingredients) {
        await familyRecipeIngredientsDB.addIngredientToFamilyRecipe(
            recipeId, ing.ingredientName, ing.amount, ing.unit
        );
    }

    // Insert preparation steps into recipe_preparation_steps
    for (const step of preparationSteps) {
        await recipeStepsDB.addPreparationStep(
            null,         // user_recipe_id
            recipeId,     // family_recipe_id
            step.stepNumber,
            step.stepDescription
        );

        // Also initialize corresponding progress record for this step
        await recipeProgressDB.addPreparationStepProgress({
            userId,
            spoonacularRecipeId: null,
            userRecipeId: null,
            familyRecipeId: recipeId,
            stepNumber: step.stepNumber
        });
    }

    return recipeId;
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
 * Updates fields of a family recipe.
 *
 * Supports partial updates – user can send only the fields to be changed.
 * Ignores null / undefined / empty string values.
 * At least one valid field is required – otherwise the request is rejected.
 * Validates that the recipe belongs to the requesting user.
 */
async function updateFamilyRecipe(recipeId, updatedFields, userId) {
    const isOwner = await familyRecipesDB.isRecipeOwnedByUser(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized – You can only update your own family recipes.");
        err.status = 403;
        throw err;
    }

    // Filter nullish or empty values
    const cleanFields = {};
    for (const [key, value] of Object.entries(updatedFields)) {
        if (value !== null && value !== undefined && value !== "") {
            cleanFields[key] = value;
        }
    }

    if (Object.keys(cleanFields).length === 0) {
        const err = new Error("At least one valid field must be provided for update.");
        err.status = 400;
        throw err;
    }

    await familyRecipesDB.updateFamilyRecipe(recipeId, cleanFields);
}

/**
 * Deletes a family recipe, including all related ingredients, steps, and progress.
 * Ensures the recipe belongs to the user before performing deletion.
 */
async function deleteFamilyRecipe(recipeId, userId) {
    // Step 1: Validate ownership
    const isOwner = await familyRecipesDB.isRecipeOwnedByUser(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized – You can only delete your own family recipes.");
        err.status = 403;
        throw err;
    }

    // Step 2: Delete all ingredients and preparation steps associated with the recipe
    await deleteAllIngredientsForFamilyRecipe(recipeId);
    await deleteAllStepsForRecipe(null, recipeId, userId);

    // Step 3: Delete all real-time progress records for this recipe
    await deleteAllProgressForFamilyRecipe(recipeId, userId);

    // Step 4: Delete the recipe itself
    await familyRecipesDB.deleteFamilyRecipeById(recipeId);
}

/**
 * Deletes all progress rows for a given user and family recipe (if any).
 */
async function deleteAllProgressForFamilyRecipe(familyRecipeId, userId) {
    await recipeProgressDB.deleteProgressForRecipe(userId, null, null, familyRecipeId);
}


async function deleteAllIngredientsForFamilyRecipe(recipeId) {
    await familyRecipeIngredientsDB.deleteAllIngredientsForFamilyRecipe(recipeId);
}

/**
 * Adds a new ingredient to a family recipe (after verifying ownership and input).
 */
async function addIngredientToFamilyRecipe(userId, recipeId, ingredientName, amount, unit) {
    // Ownership check
    const isOwner = await familyRecipesDB.isRecipeOwnedByUser(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized – You can only modify your own family recipes.");
        err.status = 403;
        throw err;
    }

    // Validate input
    if (!ingredientName || amount == null || !unit) {
        const err = new Error("Missing required fields: ingredientName, amount, unit.");
        err.status = 400;
        throw err;
    }

    await familyRecipeIngredientsDB.addIngredientToFamilyRecipe(
        recipeId, ingredientName, amount, unit
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
 * Updates an existing ingredient in a family recipe by ingredient ID.
 * Supports partial updates – only provided fields are updated.
 * Validates:
 * - ownership
 * - ingredient belongs to recipe
 * - at least one field is present
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

    // Filter only valid fields
    const cleanFields = {};
    if (ingredientName !== undefined && ingredientName !== null && ingredientName !== "") {
        cleanFields.ingredient_name = ingredientName;
    }
    if (amount !== undefined && amount !== null && amount !== "") {
        cleanFields.amount = amount;
    }
    if (unit !== undefined && unit !== null && unit !== "") {
        cleanFields.unit = unit;
    }

    if (Object.keys(cleanFields).length === 0) {
        const err = new Error("At least one valid field must be provided for update.");
        err.status = 400;
        throw err;
    }

    await familyRecipeIngredientsDB.updateFamilyIngredientById(ingredientId, cleanFields);
}




/**
 * Deletes a specific ingredient from a family recipe,
 * only if the ingredient belongs to a recipe owned by the user,
 * and only if it's **not the last** ingredient in the recipe.
 */
async function deleteFamilyIngredient(ingredientId, recipeId, userId) {
    // Step 1: Ownership verification
    const isOwner = await familyRecipesDB.isRecipeOwnedByUser(recipeId, userId);
    if (!isOwner) {
        const err = new Error("Unauthorized – You can only modify your own family recipes.");
        err.status = 403;
        throw err;
    }

    // Step 2: Ingredient-recipe association check
    const ingredientExists = await familyRecipeIngredientsDB.isIngredientInRecipe(recipeId, ingredientId);
    if (!ingredientExists) {
        const err = new Error("Can't delete a non-existent ingredient in this recipe.");
        err.status = 404;
        throw err;
    }

    // Step 3: Count total ingredients
    const ingredientCount = await familyRecipeIngredientsDB.countIngredientsByRecipeId(recipeId);
    if (ingredientCount <= 1) {
        const err = new Error("Cannot delete the last ingredient. A recipe must have at least one ingredient.");
        err.status = 400;
        throw err;
    }

    // Step 4: Perform deletion
    await familyRecipeIngredientsDB.deleteIngredientById(ingredientId);
}


/**
 * Adds a new preparation step to a recipe (user or family only),
 * while keeping both step and progress data in sync:
 * - Ensures `stepNumber` is valid
 * - If the number exists, shifts all subsequent steps forward
 * - Also shifts and inserts corresponding progress records
 *
 * @param {string} type - "my-recipes" | "my-family-recipes"
 * @param {number} recipeId
 * @param {number} stepNumber
 * @param {string} stepDescription
 * @param {number} userId
 */
async function addPreparationStepToRecipe(type, recipeId, stepNumber, stepDescription, userId) {
    if (!["my-recipes", "my-family-recipes"].includes(type)) {
        const err = new Error("Invalid recipe type. Only personal or family recipes can be modified.");
        err.status = 400;
        throw err;
    }

    if (!Number.isInteger(stepNumber) || stepNumber <= 0) {
        const err = new Error("Step number must be a positive integer.");
        err.status = 400;
        throw err;
    }

    let userRecipeId = null;
    let familyRecipeId = null;

    if (type === "my-recipes") {
        const userRecipes = await userRecipesDB.getUserRecipes(userId);
        const owns = userRecipes.some(r => r.recipe_id === recipeId);
        if (!owns) {
            const err = new Error("Unauthorized – You don't own this user recipe.");
            err.status = 403;
            throw err;
        }
        userRecipeId = recipeId;
    } else if (type === "my-family-recipes") {
        const isOwner = await familyRecipesDB.isRecipeOwnedByUser(recipeId, userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You don't own this family recipe.");
            err.status = 403;
            throw err;
        }
        familyRecipeId = recipeId;
    }

    // Retrieve all current steps for this recipe
    const steps = await recipeStepsDB.getStepsByRecipeId(userRecipeId, familyRecipeId);
    const existingStepNumbers = steps.map(step => step.step_number);
    const maxStep = existingStepNumbers.length === 0 ? 0 : Math.max(...existingStepNumbers);

    if (stepNumber > maxStep + 1) stepNumber = maxStep + 1;

    const shouldShift = existingStepNumbers.includes(stepNumber);
    if (shouldShift) {
        await recipeStepsDB.shiftStepNumbersForward(userRecipeId, familyRecipeId, stepNumber);
        await recipeProgressDB.shiftProgressStepsForward(null, userRecipeId, familyRecipeId, stepNumber);
    }

    await recipeStepsDB.addPreparationStep(userRecipeId, familyRecipeId, stepNumber, stepDescription);

    await recipeProgressDB.addPreparationStepProgress({
        userId,
        spoonacularRecipeId: null,
        userRecipeId,
        familyRecipeId,
        stepNumber
    });
}



/**
 * Returns preparation steps along with completion status for a given recipe.
 * Handles 3 recipe types: user, family, and spoonacular.
 * For spoonacular recipes, it ensures DB tracking is created on first view.
 *
 * Returns:
 * [
 *   { number: 1, step: "Boil water", isCompleted: false },
 *   { number: 2, step: "Add pasta", isCompleted: true },
 *   ...
 * ]
 *
 * @param {string} type - "my-recipes" | "my-family-recipes" | "spoonacular"
 * @param {number} recipeId - ID of the recipe
 * @param {number} userId - ID of the current user
 * @returns {Array} Array of step objects with progress status
 */
async function getPreparationSteps(type, recipeId, userId) {
    if (!["my-recipes", "my-family-recipes", "spoonacular"].includes(type)) {
        const err = new Error("Invalid recipe type.");
        err.status = 400;
        throw err;
    }

    let steps = [];
    let progress = [];

    if (type === "my-recipes") {
        const userRecipes = await userRecipesDB.getUserRecipes(userId);
        const owns = userRecipes.some(r => r.recipe_id === recipeId);
        if (!owns) {
            const err = new Error("Unauthorized – You don't own this user recipe.");
            err.status = 403;
            throw err;
        }

        steps = await recipeStepsDB.getStepsByRecipeId(recipeId, null);
        progress = await recipeProgressDB.getProgressForRecipe(userId, null, recipeId, null);
    }

    if (type === "my-family-recipes") {
        const isOwner = await familyRecipesDB.isRecipeOwnedByUser(recipeId, userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You don't own this family recipe.");
            err.status = 403;
            throw err;
        }

        steps = await recipeStepsDB.getStepsByRecipeId(null, recipeId);
        progress = await recipeProgressDB.getProgressForRecipe(userId, null, null, recipeId);
    }

    if (type === "spoonacular") {
        const spoonacularActions = require("../API_spooncular/spooncular_actions");
        const analyzed = await spoonacularActions.fetchAnalyzedInstructions(recipeId);

        // Convert to internal step format
        steps = analyzed.map(s => ({
            step_number: s.number,
            step_description: s.step
        }));

        // Check if progress already exists for this user/recipe
        const existingProgress = await recipeProgressDB.getProgressForRecipe(userId, recipeId, null, null);

        // If no tracking yet, create it in DB
        if (existingProgress.length === 0) {
            for (const s of steps) {
                await recipeProgressDB.addPreparationStepProgress({
                    userId,
                    spoonacularRecipeId: recipeId,
                    userRecipeId: null,
                    familyRecipeId: null,
                    stepNumber: s.step_number
                });
            }
        }

        progress = await recipeProgressDB.getProgressForRecipe(userId, recipeId, null, null);
    }

    // Merge steps with progress status
    return steps.map(s => ({
        number: s.step_number,
        step: s.step_description,
        isCompleted: !!progress.find(p => p.step_number === s.step_number && p.is_completed)
    }));
}





/**
 * Updates the description of a preparation step.
 *
 * Validates:
 * - Step exists
 * - Belongs to a recipe owned by the current user
 * - Type is correct ('my-recipes' or 'my-family-recipes')
 * - Only step_description can be updated (not step_number)
 */
async function updatePreparationStep(type, stepId, newDescription, userId) {
    const stepData = await recipeStepsDB.getStepById(stepId);
    if (!stepData) {
        const err = new Error("Step not found.");
        err.status = 404;
        throw err;
    }

    const { user_recipe_id, family_recipe_id } = stepData;

    if (type === "my-recipes") {
        const userRecipes = await userRecipesDB.getUserRecipes(userId);
        const owns = userRecipes.some(r => r.recipe_id === user_recipe_id);
        if (!owns) {
            const err = new Error("Unauthorized – You don't own this step.");
            err.status = 403;
            throw err;
        }
    } else if (type === "my-family-recipes") {
        const isOwner = await familyRecipesDB.isRecipeOwnedByUser(family_recipe_id, userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You don't own this step.");
            err.status = 403;
            throw err;
        }
    } else {
        const err = new Error("Invalid recipe type.");
        err.status = 400;
        throw err;
    }

    await recipeStepsDB.updateStepDescription(stepId, newDescription);
}



/**
 * Deletes a preparation step from either a user or family recipe.
 *
 * This function ensures full data consistency:
 * - Validates that the type is 'my-recipes' or 'my-family-recipes'
 * - Ensures the step exists
 * - Verifies the step belongs to the requesting user
 * - Prevents deletion if it's the only remaining step
 * - Deletes the step from `recipe_preparation_steps`
 * - Deletes and shifts progress data from `recipe_preparation_progress`
 *   so that remaining steps preserve correct step_number sequence
 *
 * @param {string} type - 'my-recipes' | 'my-family-recipes'
 * @param {number} stepId - ID of the step to delete
 * @param {number} userId - ID of the user making the request
 */
async function deletePreparationStep(type, stepId, userId) {
    if (!["my-recipes", "my-family-recipes"].includes(type)) {
        const err = new Error("Invalid recipe type. Only personal or family recipes can be modified.");
        err.status = 400;
        throw err;
    }

    const step = await recipeStepsDB.getStepById(stepId);
    if (!step) {
        const err = new Error("Step not found.");
        err.status = 404;
        throw err;
    }

    const { step_number, user_recipe_id, family_recipe_id } = step;

    if (type === "my-recipes") {
        const isOwner = await userRecipesDB.isUserRecipeOwner(user_recipe_id, userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You can only delete your own recipe steps.");
            err.status = 403;
            throw err;
        }
    } else if (type === "my-family-recipes") {
        const isOwner = await familyRecipesDB.isRecipeOwnedByUser(family_recipe_id, userId);
        if (!isOwner) {
            const err = new Error("Unauthorized – You can only delete your own family recipe steps.");
            err.status = 403;
            throw err;
        }
    }

    const steps = await recipeStepsDB.getStepsByRecipeId(user_recipe_id, family_recipe_id);
    if (steps.length <= 1) {
        const err = new Error("Cannot delete the last remaining step. A recipe must contain at least one step.");
        err.status = 400;
        throw err;
    }

    await recipeStepsDB.deleteStepById(stepId);
    await recipeStepsDB.shiftStepNumbersBackward(user_recipe_id, family_recipe_id, step_number);
    await recipeProgressDB.shiftProgressStepsBackward(null, user_recipe_id, family_recipe_id, step_number);
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
 * Marks a preparation step as completed for a specific user and recipe type.
 * Supports user-created, family, and spoonacular recipes.
 *
 * Validates:
 * - `type` is one of 'my-recipes', 'my-family-recipes', 'spoonacular'
 * - Step exists in progress table (implicitly assumed)
 *
 * @param {string} type - Recipe type
 * @param {number} recipeId - ID of the recipe
 * @param {number} stepNumber - Step number to mark as completed
 * @param {number} userId - Current user performing the action
 */
async function completePreparationStep(type, recipeId, stepNumber, userId) {
    if (!["my-recipes", "my-family-recipes", "spoonacular"].includes(type)) {
        const err = new Error("Invalid recipe type.");
        err.status = 400;
        throw err;
    }

    const spoonacularId = type === "spoonacular" ? recipeId : null;
    const userRecipeId = type === "my-recipes" ? recipeId : null;
    const familyRecipeId = type === "my-family-recipes" ? recipeId : null;

    await recipeProgressDB.completeStep(
        userId,
        spoonacularId,
        userRecipeId,
        familyRecipeId,
        stepNumber
    );
}


/**
 * Marks a preparation step as uncompleted for a specific user and recipe type.
 * Supports user-created, family, and spoonacular recipes.
 *
 * Validates:
 * - `type` is one of 'my-recipes', 'my-family-recipes', 'spoonacular'
 *
 * @param {string} type - Recipe type
 * @param {number} recipeId - ID of the recipe
 * @param {number} stepNumber - Step number to unmark
 * @param {number} userId - Current user performing the action
 */
async function uncompletePreparationStep(type, recipeId, stepNumber, userId) {
    if (!["my-recipes", "my-family-recipes", "spoonacular"].includes(type)) {
        const err = new Error("Invalid recipe type.");
        err.status = 400;
        throw err;
    }

    const spoonacularId = type === "spoonacular" ? recipeId : null;
    const userRecipeId = type === "my-recipes" ? recipeId : null;
    const familyRecipeId = type === "my-family-recipes" ? recipeId : null;

    await recipeProgressDB.uncompleteStep(
        userId,
        spoonacularId,
        userRecipeId,
        familyRecipeId,
        stepNumber
    );
}

/**
 * Retrieves percentage of completed preparation steps for a given recipe and user.
 * Supports all recipe types: user, family, and spoonacular.
 *
 * Returns: { total: number, completed: number, percentage: number }
 */
async function getRecipeProgress(type, recipeId, userId) {
    if (!["my-recipes", "my-family-recipes", "spoonacular"].includes(type)) {
        const err = new Error("Invalid recipe type.");
        err.status = 400;
        throw err;
    }

    const spoonacularId = type === "spoonacular" ? recipeId : null;
    const userRecipeId = type === "my-recipes" ? recipeId : null;
    const familyRecipeId = type === "my-family-recipes" ? recipeId : null;

    const rows = await recipeProgressDB.getProgressForRecipe(
        userId,
        spoonacularId,
        userRecipeId,
        familyRecipeId
    );

    const total = rows.length;
    const completed = rows.filter(r => r.is_completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, percentage };
}


/**
 * Resets the preparation progress for a given recipe type (user/family/spoonacular).
 * Deletes all progress records for the current user and selected recipe.
 *
 * @param {string} type - 'my-recipes' | 'my-family-recipes' | 'spoonacular'
 * @param {number} recipeId - ID of the recipe
 * @param {number} userId - ID of the user performing the reset
 */
async function resetRecipeProgress(type, recipeId, userId) {
    if (!["my-recipes", "my-family-recipes", "spoonacular"].includes(type)) {
        const err = new Error("Invalid recipe type.");
        err.status = 400;
        throw err;
    }

    const spoonacularId = type === "spoonacular" ? recipeId : null;
    const userRecipeId = type === "my-recipes" ? recipeId : null;
    const familyRecipeId = type === "my-family-recipes" ? recipeId : null;

    await recipeProgressDB.resetProgressForRecipe(
        userId,
        spoonacularId,
        userRecipeId,
        familyRecipeId
    );

}


async function getFamilyRecipesByUserId(userId) {
    return await familyRecipesDB.getFamilyRecipesByUserId(userId);
}


/**
 * Retrieves a specific personal recipe by its ID, after verifying ownership.
 */
async function getUserRecipeById(recipeId, userId) {
    const allRecipes = await userRecipesDB.getUserRecipes(userId);
    const recipe = allRecipes.find(r => r.recipe_id === parseInt(recipeId));

    if (!recipe) {
        const err = new Error("Recipe not found or not owned by user.");
        err.status = 404;
        throw err;
    }

    return recipe;
}


module.exports = {
    getUserRecipeById,
    getFamilyRecipesByUserId,
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
    addPersonalRecipe,
    getAllUserRecipes,
    deletePersonalRecipe
};


