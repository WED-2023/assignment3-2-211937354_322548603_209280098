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

// Delete a personal recipe by its ID
async function deleteUserRecipe(recipeId) {
    await db.execute(
        "DELETE FROM user_recipes WHERE recipe_id = ?",
        [recipeId]
    );
}

// Update a recipe's popularity score by ID
async function updatePopularity(recipeId, newScore) {
    await db.execute(
        "UPDATE user_recipes SET popularity_score = ? WHERE recipe_id = ?",
        [newScore, recipeId]
    );
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
    createUserRecipe,
    getUserRecipes,
    deleteUserRecipe,
    updatePopularity,
    updateUserRecipe,
};