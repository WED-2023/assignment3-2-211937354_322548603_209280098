// This module provides access to the 'user_recipe_ingredients' table in the database.
// It supports inserting, retrieving, updating, and deleting ingredients for user-created recipes.

const db = require("../db_connection");

// Insert a new ingredient to a user recipe
async function addIngredientToUserRecipe(recipeId, ingredientName, amount, unit) {
    const query = `
        INSERT INTO user_recipe_ingredients (recipe_id, ingredient_name, amount, unit)
        VALUES (?, ?, ?, ?)
    `;
    await db.execute(query, [recipeId, ingredientName, amount, unit]);
}

// Get all ingredients for a specific user recipe
async function getIngredientsByRecipeId(recipeId) {
    const [rows] = await db.execute(
        "SELECT * FROM user_recipe_ingredients WHERE recipe_id = ?",
        [recipeId]
    );
    return rows;
}

// Check if ingredient belongs to a recipe owned by the user
async function isIngredientOwnedByUser(ingredientId, userId) {
    const query = `
        SELECT 1
        FROM user_recipe_ingredients AS uri
        JOIN user_recipes AS ur ON uri.recipe_id = ur.recipe_id
        WHERE uri.ingredient_id = ? AND ur.user_id = ?
    `;
    const [rows] = await db.execute(query, [ingredientId, userId]);
    return rows.length > 0;
}


// Update an existing ingredient by ingredient_id
async function updateIngredient(ingredientId, updatedFields) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updatedFields)) {
        fields.push(`${key} = ?`);
        values.push(value);
    }

    const query = `
        UPDATE user_recipe_ingredients
        SET ${fields.join(', ')}
        WHERE ingredient_id = ?
    `;
    values.push(ingredientId);
    await db.execute(query, values);
}

// Delete a single ingredient by its ID
async function deleteIngredientById(ingredientId) {
    await db.execute(
        "DELETE FROM user_recipe_ingredients WHERE ingredient_id = ?",
        [ingredientId]
    );
}

// Delete all ingredients for a specific recipe (used when deleting a recipe)
async function deleteIngredientsByRecipeId(recipeId) {
    await db.execute(
        "DELETE FROM user_recipe_ingredients WHERE recipe_id = ?",
        [recipeId]
    );
}

// Returns the recipe ID for a given ingredient
async function getRecipeIdByIngredientId(ingredientId) {
    const query = `SELECT recipe_id FROM user_recipe_ingredients WHERE ingredient_id = ?`;
    const [rows] = await db.execute(query, [ingredientId]);
    return rows.length > 0 ? rows[0].recipe_id : null;
}

// Count how many ingredients exist for a given recipe
async function countIngredientsByRecipeId(recipeId) {
    const query = `
        SELECT COUNT(*) AS count
        FROM user_recipe_ingredients
        WHERE recipe_id = ?
    `;
    const [rows] = await db.execute(query, [recipeId]);
    return rows[0]?.count || 0;
}



module.exports = {
    countIngredientsByRecipeId,
    getRecipeIdByIngredientId,
    isIngredientOwnedByUser,
    addIngredientToUserRecipe,
    getIngredientsByRecipeId,
    updateIngredient,
    deleteIngredientById,
    deleteIngredientsByRecipeId,
};
