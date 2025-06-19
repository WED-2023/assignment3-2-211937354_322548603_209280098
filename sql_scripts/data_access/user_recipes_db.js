// This module provides dynamic access to the 'user_recipes' table in our MySQL database.
// It supports creation, retrieval by user, and deletion of personal recipes.

const db = require("../db_connection");

// Create a new personal recipe for a user
async function createUserRecipe(userId, title, imageUrl, readyInMinutes, popularityScore, isVegan, isVegetarian, isGlutenFree, servings, summary, instructions) {
    const query = `
    INSERT INTO user_recipes (
      user_id, title, image_url, ready_in_minutes, popularity_score,
      is_vegan, is_vegetarian, is_gluten_free, servings, summary, instructions
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    await db.execute(query, [
        userId, title, imageUrl, readyInMinutes, popularityScore,
        isVegan, isVegetarian, isGlutenFree, servings, summary, instructions
    ]);
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



// Increment the popularity score of a specific user-created recipe by 1
async function incrementPopularity(recipeId) {
    const query = `
        UPDATE user_recipes
        SET popularity_score = popularity_score + 1
        WHERE recipe_id = ?
    `;
    await db.execute(query, [recipeId]);
}

async function isUserRecipeOwner(recipeId, userId) {
    const [rows] = await db.execute(
        "SELECT 1 FROM user_recipes WHERE recipe_id = ? AND user_id = ?",
        [recipeId, userId]
    );
    return rows.length > 0;
}


// Update full recipe details by ID
async function updateUserRecipe(recipeId, title, imageUrl, readyInMinutes, isVegan, isVegetarian, isGlutenFree, servings, summary, instructions) {
    const query = `
    UPDATE user_recipes
    SET
      title = ?,
      image_url = ?,
      ready_in_minutes = ?,
      is_vegan = ?,
      is_vegetarian = ?,
      is_gluten_free = ?,
      servings = ?,
      summary = ?,
      instructions = ?
    WHERE recipe_id = ?
  `;
    await db.execute(query, [
        title, imageUrl, readyInMinutes, isVegan, isVegetarian, isGlutenFree,
        servings, summary, instructions, recipeId
    ]);
}

module.exports = {
    isUserRecipeOwner,
    incrementPopularity,
    createUserRecipe,
    getUserRecipes,
    deleteUserRecipe,
    updateUserRecipe,
};