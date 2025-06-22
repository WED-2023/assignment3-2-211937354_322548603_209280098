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



// Partial update of family ingredient using dynamic fields
async function updateFamilyIngredientById(ingredientId, updatedFields) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updatedFields)) {
        fields.push(`${key} = ?`);
        values.push(value);
    }

    const query = `
        UPDATE family_recipe_ingredients
        SET ${fields.join(', ')}
        WHERE ingredient_id = ?
    `;
    values.push(ingredientId);
    await db.execute(query, values);
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
// Delete all ingredients for a specific family recipe
async function deleteAllIngredientsForFamilyRecipe(recipeId) {
    await db.execute(
        "DELETE FROM family_recipe_ingredients WHERE recipe_id = ?",
        [recipeId]
    );
}

// Count how many ingredients exist for a given family recipe
async function countIngredientsByRecipeId(recipeId) {
    const query = `
        SELECT COUNT(*) AS count
        FROM family_recipe_ingredients
        WHERE recipe_id = ?
    `;
    const [rows] = await db.execute(query, [recipeId]);
    return rows[0]?.count || 0;
}



module.exports = {
    countIngredientsByRecipeId,
    deleteAllIngredientsForFamilyRecipe,
    isIngredientInRecipe,
    addIngredientToFamilyRecipe,
    getIngredientsByFamilyRecipeId,
    updateFamilyIngredientById,
    deleteIngredientById,
};
