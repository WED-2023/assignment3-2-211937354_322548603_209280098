// This module manages meal plan entries in the 'meal_plans' table.
// It supports assigning various types of recipes (user, family, or spoonacular) to a user's weekly meal plan.

const db = require("../db_connection");

// Add a new meal plan entry for a user
async function addMealPlan(userId, spoonacularId, userRecipeId, familyRecipeId, orderInMeal) {
    const query = `
        INSERT INTO meal_plans (user_id, spoonacular_recipe_id, user_recipe_id, family_recipe_id, order_in_meal)
        VALUES (?, ?, ?, ?, ?)
    `;
    await db.execute(query, [userId, spoonacularId, userRecipeId, familyRecipeId, orderInMeal]);
}

// Get all meal plans for a user
async function getMealPlansByUserId(userId) {
    const [rows] = await db.execute(
        "SELECT * FROM meal_plans WHERE user_id = ? ORDER BY order_in_meal ASC",
        [userId]
    );
    return rows;
}

// Delete a single meal plan entry by its ID
async function deleteMealPlanById(planId) {
    await db.execute(
        "DELETE FROM meal_plans WHERE plan_id = ?",
        [planId]
    );
}

// Delete all meal plan entries for a user
async function deleteMealPlansByUserId(userId) {
    await db.execute(
        "DELETE FROM meal_plans WHERE user_id = ?",
        [userId]
    );
}

module.exports = {
    addMealPlan,
    getMealPlansByUserId,
    deleteMealPlanById,
    deleteMealPlansByUserId
};
