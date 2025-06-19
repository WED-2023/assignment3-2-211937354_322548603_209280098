// This module provides access to the 'user_favorites' table.
// It supports adding, retrieving, and deleting favorite recipes saved by the user.

const db = require("../db_connection");

// Add a recipe to the user's favorites
async function addFavorite(userId, spoonacularRecipeId, source) {
    const query = `
        INSERT INTO user_favorites (user_id, recipe_id, source)
        VALUES (?, ?, ?)
    `;
    await db.execute(query, [userId, spoonacularRecipeId, source]);
}

// Get all favorite recipes of a specific user
async function getFavoritesByUserId(userId) {
    const [rows] = await db.execute(
        "SELECT * FROM user_favorites WHERE user_id = ?",
        [userId]
    );
    return rows;
}

// Delete a favorite recipe for a user
async function deleteFavorite(userId, spoonacularRecipeId) {
    const query = `
        DELETE FROM user_favorites
        WHERE user_id = ? AND recipe_id = ?
    `;
    await db.execute(query, [userId, spoonacularRecipeId]);
}

module.exports = {
    addFavorite,
    getFavoritesByUserId,
    deleteFavorite,
};
