// This module tracks real-time preparation progress of a recipe in the 'recipe_preparation_progress' table.
// It supports inserting, updating, and retrieving the user's current progress during step-by-step preparation.

const db = require("../db_connection");

// Add a new preparation step for tracking (for a specific recipe type)
async function addPreparationStepProgress(userId, spoonacularId, userRecipeId, familyRecipeId, stepNumber) {
    const query = `
        INSERT INTO recipe_preparation_progress (
            user_id, spoonacular_recipe_id, user_recipe_id, family_recipe_id, step_number
        )
        VALUES (?, ?, ?, ?, ?)
    `;
    await db.execute(query, [userId, spoonacularId, userRecipeId, familyRecipeId, stepNumber]);
}

// Mark a step as completed
async function completeStep(userId, spoonacularId, userRecipeId, familyRecipeId, stepNumber) {
    const query = `
        UPDATE recipe_preparation_progress
        SET is_completed = TRUE, completed_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND spoonacular_recipe_id <=> ? AND user_recipe_id <=> ? AND family_recipe_id <=> ? AND step_number = ?
    `;
    await db.execute(query, [userId, spoonacularId, userRecipeId, familyRecipeId, stepNumber]);
}

// Get progress for a specific recipe (per user)
async function getProgressForRecipe(userId, spoonacularId, userRecipeId, familyRecipeId) {
    const [rows] = await db.execute(
        `SELECT * FROM recipe_preparation_progress
         WHERE user_id = ? AND spoonacular_recipe_id <=> ? AND user_recipe_id <=> ? AND family_recipe_id <=> ?
         ORDER BY step_number ASC`,
        [userId, spoonacularId, userRecipeId, familyRecipeId]
    );
    return rows;
}

// Unmark a previously completed step (set is_completed = false and clear completed_at)
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


// Reset progress (e.g., for restarting recipe session)
async function deleteProgressForRecipe(userId, spoonacularId, userRecipeId, familyRecipeId) {
    await db.execute(
        `DELETE FROM recipe_preparation_progress
         WHERE user_id = ? AND spoonacular_recipe_id <=> ? AND user_recipe_id <=> ? AND family_recipe_id <=> ?`,
        [userId, spoonacularId, userRecipeId, familyRecipeId]
    );
}


module.exports = {
    addPreparationStepProgress,
    markStepCompleted,
    uncompleteStep,
    getProgressByUserAndRecipe,
    resetProgressForRecipe
};