// This module provides access to the 'family_recipe_ingredients' table in the database.
// It supports inserting, retrieving, updating, and deleting ingredients for family recipes.

const db = require("../db_connection");

// Add a new ingredient to a family recipe
async function addIngredientToFamilyRecipe(recipeId, ingredientName, amount, unit) {
    const query = `
        INSERT INTO family_recipe_ingredients (recipe_id, ingredient_name, amount, unit)
        VALUES (?, ?, ?, ?)
    `;
    await db.execute(query, [recipeId, ingredientName, amount, unit]);
}

// Retrieve all ingredients for a given family recipe
async function getIngredientsByFamilyRecipeId(recipeId) {
    const [rows] = await db.execute(
        "SELECT * FROM family_recipe_ingredients WHERE recipe_id = ?",
        [recipeId]
    );
    return rows;
}



// Update an existing ingredient by its ID
async function updateFamilyIngredientById(ingredientId, ingredientName, amount, unit) {
    const query = `
        UPDATE family_recipe_ingredients
        SET ingredient_name = ?, amount = ?, unit = ?
        WHERE ingredient_id = ?
    `;
    await db.execute(query, [ingredientName, amount, unit, ingredientId]);
}
async function isIngredientInRecipe(recipeId, ingredientId) {
    const [[row]] = await db.execute(
        `SELECT 1 FROM family_recipe_ingredients
         WHERE recipe_id = ? AND ingredient_id = ?`,
        [recipeId, ingredientId]
    );
    return !!row;
}

// Delete an ingredient by its ID
async function deleteIngredientById(ingredientId) {
    await db.execute("DELETE FROM family_recipe_ingredients WHERE ingredient_id = ?", [ingredientId]);
}

module.exports = {
    isIngredientInRecipe,
    addIngredientToFamilyRecipe,
    getIngredientsByFamilyRecipeId,
    updateFamilyIngredientById,
    deleteIngredientById,
};
