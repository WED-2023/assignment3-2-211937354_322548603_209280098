// This module handles operations on the 'recipe_preparation_steps' table,
// which stores step-by-step instructions for user or family recipes.

const db = require("../db_connection");

// Insert a new preparation step for a recipe (user or family)
async function addPreparationStep(userRecipeId, familyRecipeId, stepNumber, stepDescription) {
    const query = `
        INSERT INTO recipe_preparation_steps (
            user_recipe_id, family_recipe_id, step_number, step_description
        )
        VALUES (?, ?, ?, ?)
    `;
    await db.execute(query, [userRecipeId, familyRecipeId, stepNumber, stepDescription]);
}

// Retrieve all steps for a specific recipe
async function getStepsByRecipeId(userRecipeId, familyRecipeId) {
    const query = `
        SELECT * FROM recipe_preparation_steps
        WHERE user_recipe_id <=> ?
          AND family_recipe_id <=> ?
        ORDER BY step_number

    `;
    const [rows] = await db.execute(query, [userRecipeId, familyRecipeId]);
    return rows;
}

// Update a preparation step's description (by step ID)
async function updateStepDescription(stepId, newDescription) {
    const query = `
        UPDATE recipe_preparation_steps
        SET step_description = ?
        WHERE step_id = ?
    `;
    await db.execute(query, [newDescription, stepId]);
}

// Delete a single step (by step ID)
async function deleteStepById(stepId) {
    await db.execute(
        "DELETE FROM recipe_preparation_steps WHERE step_id = ?",
        [stepId]
    );
}

async function getStepById(stepId) {
    const [rows] = await db.execute(
        "SELECT * FROM recipe_preparation_steps WHERE step_id = ?",
        [stepId]
    );
    return rows[0] || null;
}


// Delete all steps associated with a given recipe
async function deleteAllStepsByRecipe(userRecipeId, familyRecipeId) {
    const query = `
        DELETE FROM recipe_preparation_steps
        WHERE user_recipe_id <=> ?
          AND family_recipe_id <=> ?
    `;
    await db.execute(query, [userRecipeId, familyRecipeId]);
}

// Shift all steps forward (step_number++) starting from a given step number
async function shiftStepNumbersForward(userRecipeId, familyRecipeId, fromStepNumber) {
    const query = `
        UPDATE recipe_preparation_steps
        SET step_number = step_number + 1
        WHERE (user_recipe_id <=> ?) AND (family_recipe_id <=> ?)
        AND step_number >= ?
        ORDER BY step_number DESC
    `;
    await db.execute(query, [userRecipeId, familyRecipeId, fromStepNumber]);
}

// Shift down all steps with higher step_number (after deletion)
async function shiftStepNumbersBackward(userRecipeId, familyRecipeId, deletedStepNumber) {
    const query = `
        UPDATE recipe_preparation_steps
        SET step_number = step_number - 1
        WHERE (user_recipe_id <=> ?) AND (family_recipe_id <=> ?)
        AND step_number > ?
        ORDER BY step_number ASC
    `;
    await db.execute(query, [userRecipeId, familyRecipeId, deletedStepNumber]);
}



module.exports = {
    shiftStepNumbersBackward,
    shiftStepNumbersForward,
    getStepById,
    addPreparationStep,
    getStepsByRecipeId,
    updateStepDescription,
    deleteStepById,
    deleteAllStepsByRecipe
};
