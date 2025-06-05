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


module.exports = {
    addIngredientToUserRecipe,
    getIngredientsByRecipeId,
    updateIngredient,
    deleteIngredientById,
    deleteIngredientsByRecipeId,
};
