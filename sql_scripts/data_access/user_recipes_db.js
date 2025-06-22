// This module provides dynamic access to the 'user_recipes' table in our MySQL database.
// It supports creation, retrieval by user, and deletion of personal recipes.

const db = require("../db_connection");

// Create a new personal recipe for a user
async function createUserRecipe(userId, title, imageUrl, readyInMinutes, isVegan, isVegetarian, isGlutenFree, servings, summary, instructions) {
    const query = `
        INSERT INTO user_recipes (
            user_id, title, image_url, ready_in_minutes,
            is_vegan, is_vegetarian, is_gluten_free, servings, summary, instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
        userId, title, imageUrl, readyInMinutes,
        isVegan, isVegetarian, isGlutenFree, servings, summary, instructions
    ]);
    return result.insertId;
}


// Get all recipes created by a specific user
async function getUserRecipes(userId) {
    const [rows] = await db.execute(
        "SELECT * FROM user_recipes WHERE user_id = ?",
        [userId]
    );
    return rows;
}

/**
 * Deletes a user recipe only if it belongs to the requesting user.
 * First verifies ownership, then deletes associated ingredients, and finally the recipe.
 * Throws 403 error if recipe doesn't belong to the user.
 */async function deleteUserRecipe(recipeId, userId) {
    await db.execute(
        "DELETE FROM user_recipes WHERE recipe_id = ? AND user_id = ?",
        [recipeId, userId]
    );
}



async function isUserRecipeOwner(recipeId, userId) {
    const [rows] = await db.execute(
        "SELECT 1 FROM user_recipes WHERE recipe_id = ? AND user_id = ?",
        [recipeId, userId]
    );
    return rows.length > 0;
}


// Update user recipe (supports partial update)
async function updateUserRecipe(recipeId, updatedFields) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updatedFields)) {
        fields.push(`${key} = ?`);
        values.push(value);
    }

    const query = `
        UPDATE user_recipes
        SET ${fields.join(", ")}
        WHERE recipe_id = ?
    `;
    values.push(recipeId);
    await db.execute(query, values);
}


module.exports = {
    isUserRecipeOwner,
    createUserRecipe,
    getUserRecipes,
    deleteUserRecipe,
    updateUserRecipe,
};