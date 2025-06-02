// This module provides access to the 'recipe_views' table.
// It supports tracking and retrieving recipe views performed by a user.

const db = require("../db_connection");

// Log a new view by user on a spoonacular recipe
async function addRecipeView(userId, spoonacularRecipeId) {
    const query = `
        INSERT INTO recipe_views (user_id, spoonacular_recipe_id)
        VALUES (?, ?)
    `;
    await db.execute(query, [userId, spoonacularRecipeId]);
}

// Get all views of a user
async function getViewsByUserId(userId) {
    const [rows] = await db.execute(
        "SELECT * FROM recipe_views WHERE user_id = ?",
        [userId]
    );
    return rows;
}

// Delete all views for a user (for cleanup or reset)
async function deleteViewsByUserId(userId) {
    await db.execute(
        "DELETE FROM recipe_views WHERE user_id = ?",
        [userId]
    );
}

module.exports = {
    addRecipeView,
    getViewsByUserId,
    deleteViewsByUserId,
};
