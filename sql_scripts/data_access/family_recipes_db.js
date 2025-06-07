// This module provides access to the 'family_recipes' table in the database.
// It supports inserting, retrieving, updating, and deleting shared family recipes.

const db = require("../db_connection");

// Create a new family recipe
async function createFamilyRecipe(userId, title, ownerName, whenToPrepare, imageUrl, readyInMinutes, servings, instructions) {
    const query = `
        INSERT INTO family_recipes (
            user_id, title, owner_name, when_to_prepare, image_url, ready_in_minutes, servings, instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.execute(query, [userId, title, ownerName, whenToPrepare, imageUrl, readyInMinutes, servings, instructions]);
}

// Retrieve all family recipes
async function getAllFamilyRecipes() {
    const [rows] = await db.execute("SELECT * FROM family_recipes");
    return rows;
}

// Retrieve a family recipe by ID
async function getFamilyRecipeById(recipeId) {
    const [rows] = await db.execute("SELECT * FROM family_recipes WHERE recipe_id = ?", [recipeId]);
    return rows[0];
}

// Retrieve all family recipes created by a specific user
async function getFamilyRecipesByUserId(userId) {
    const [rows] = await db.execute("SELECT * FROM family_recipes WHERE user_id = ?", [userId]);
    return rows;
}

// Update a family recipe dynamically by ID
async function updateFamilyRecipe(recipeId, updatedFields) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updatedFields)) {
        fields.push(`${key} = ?`);
        values.push(value);
    }

    const query = `
        UPDATE family_recipes
        SET ${fields.join(', ')}
        WHERE recipe_id = ?
    `;
    values.push(recipeId);
    await db.execute(query, values);
}

// Delete a family recipe by ID
async function deleteFamilyRecipeById(recipeId) {
    await db.execute("DELETE FROM family_recipes WHERE recipe_id = ?", [recipeId]);
}

module.exports = {
    createFamilyRecipe,
    getAllFamilyRecipes,
    getFamilyRecipeById,
    getFamilyRecipesByUserId,
    updateFamilyRecipe,
    deleteFamilyRecipeById,
};
