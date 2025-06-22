// This module tracks real-time preparation progress of a recipe in the 'recipe_preparation_progress' table.
// It supports inserting, updating, and retrieving the user's current progress during step-by-step preparation.

const db = require("../db_connection");

// Add a new preparation step for tracking (for a specific recipe type)
async function addPreparationStepProgress({userId, spoonacularRecipeId = null, userRecipeId = null, familyRecipeId = null, stepNumber}) {
    const query = `
        INSERT INTO recipe_preparation_progress (user_id, spoonacular_recipe_id, user_recipe_id, family_recipe_id, step_number)
        VALUES (?, ?, ?, ?, ?)
    `;
    await db.execute(query, [userId, spoonacularRecipeId, userRecipeId, familyRecipeId, stepNumber]);
}


// ✅ Marks a step as completed for a given user and recipe context
async function completeStep(userId, spoonacularId, userRecipeId, familyRecipeId, stepNumber) {
    const query = `
        UPDATE recipe_preparation_progress
        SET is_completed = TRUE, completed_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND spoonacular_recipe_id <=> ? AND user_recipe_id <=> ? AND family_recipe_id <=> ? AND step_number = ?
    `;
    await db.execute(query, [userId, spoonacularId, userRecipeId, familyRecipeId, stepNumber]);
}


// Retrieves progress records for a specific recipe and user
async function getProgressForRecipe(userId, spoonacularId, userRecipeId, familyRecipeId) {
    const [rows] = await db.execute(
        `SELECT * FROM recipe_preparation_progress
         WHERE user_id = ? AND spoonacular_recipe_id <=> ? AND user_recipe_id <=> ? AND family_recipe_id <=> ?
         ORDER BY step_number ASC`,
        [userId, spoonacularId, userRecipeId, familyRecipeId]
    );
    return rows;
}

// ✅ Unmarks a previously completed step (reset is_completed and clear completed_at)
async function uncompleteStep(userId, spoonacularId, userRecipeId, familyRecipeId, stepNumber) {
    const query = `
        UPDATE recipe_preparation_progress
        SET is_completed = FALSE,
            completed_at = NULL
        WHERE user_id = ?
          AND spoonacular_recipe_id <=> ?
          AND user_recipe_id <=> ?
          AND family_recipe_id <=> ?
          AND step_number = ?
    `;
    await db.execute(query, [userId, spoonacularId, userRecipeId, familyRecipeId, stepNumber]);
}


// Reset progress for all steps in a recipe (sets is_completed = false and clears timestamp)
async function resetProgressForRecipe(userId, spoonacularId, userRecipeId, familyRecipeId) {
    await db.execute(
        `UPDATE recipe_preparation_progress
         SET is_completed = FALSE,
             completed_at = NULL
         WHERE user_id = ?
           AND spoonacular_recipe_id <=> ?
           AND user_recipe_id <=> ?
           AND family_recipe_id <=> ?`,
        [userId, spoonacularId, userRecipeId, familyRecipeId]
    );
}


/**
 * Shifts all progress step numbers (>= given) forward by 1
 * for a specific recipe type (only one recipe ID should be non-null).
 */
async function shiftProgressStepsForward(spoonacularId, userRecipeId, familyRecipeId, fromStep) {
    await db.execute(`
        UPDATE recipe_preparation_progress
        SET step_number = step_number + 1
        WHERE spoonacular_recipe_id <=> ?
          AND user_recipe_id <=> ?
          AND family_recipe_id <=> ?
          AND step_number >= ?
    `, [spoonacularId, userRecipeId, familyRecipeId, fromStep]);
}

/**
 * Shifts progress steps backward starting from a specific step number.
 * Used when a step is deleted – all steps after it are renumbered.
 */
async function shiftProgressStepsBackward(spoonacularId, userRecipeId, familyRecipeId, fromStep) {
    await db.execute(`
        UPDATE recipe_preparation_progress
        SET step_number = step_number - 1
        WHERE spoonacular_recipe_id <=> ?
          AND user_recipe_id <=> ?
          AND family_recipe_id <=> ?
          AND step_number > ?
    `, [spoonacularId, userRecipeId, familyRecipeId, fromStep]);
}


// Deletes all preparation progress entries for a given user and recipe
async function deleteProgressForRecipe(userId, spoonacularId, userRecipeId, familyRecipeId) {
    await db.execute(
        `DELETE FROM recipe_preparation_progress
         WHERE user_id = ?
           AND spoonacular_recipe_id <=> ?
           AND user_recipe_id <=> ?
           AND family_recipe_id <=> ?`,
        [userId, spoonacularId, userRecipeId, familyRecipeId]
    );
}


module.exports = {
    deleteProgressForRecipe,
    shiftProgressStepsBackward,
    shiftProgressStepsForward,
    addPreparationStepProgress,
    completeStep,
    uncompleteStep,
    getProgressForRecipe,
    resetProgressForRecipe
};
