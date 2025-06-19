// This module manages meal plan entries in the 'meal_plans' table.
// It supports assigning various types of recipes (user, family, or spoonacular) to a user's weekly meal plan.

const db = require("../db_connection");

// Add a new meal plan entry for a user

async function addMealPlan(userId, recipeId, source, orderInMeal) {
    const query = `
        INSERT INTO meal_plans (user_id, recipe_id, source, order_in_meal)
        VALUES (?, ?, ?, ?)
    `;
    await db.execute(query, [userId, recipeId, source, orderInMeal]);
}


// Get all meal plans for a user (sorted by position)
async function getMealPlansByUserId(userId) {
    const [rows] = await db.execute(
        `SELECT * FROM meal_plans WHERE user_id = ? ORDER BY order_in_meal ASC`,
        [userId]
    );
    return rows;
}

// Delete a specific meal plan by its plan ID

async function deleteMealPlanById(planId, userId) {
    // Step 1: Get the order of the deleted plan
    const [[deleted]] = await db.execute(
        "SELECT order_in_meal FROM meal_plans WHERE plan_id = ? AND user_id = ?",
        [planId, userId]
    );

    if (!deleted) return;

    const deletedOrder = deleted.order_in_meal;

    // Step 2: Delete the plan – with added user_id condition for safety
    await db.execute(
        "DELETE FROM meal_plans WHERE plan_id = ? AND user_id = ?",
        [planId, userId]
    );

    // Step 3: Update the order of remaining plans
    await db.execute(
        `UPDATE meal_plans
         SET order_in_meal = order_in_meal - 1
         WHERE user_id = ? AND order_in_meal > ?`,
        [userId, deletedOrder]
    );
}


// Delete all meal plan entries for a user
async function deleteMealPlansByUserId(userId) {
    await db.execute(
        "DELETE FROM meal_plans WHERE user_id = ?",
        [userId]
    );
}

// Count how many meals the user has in the plan (for progress bar)
async function getMealPlanCount(userId) {
    const [[{ count }]] = await db.execute(
        "SELECT COUNT(*) AS count FROM meal_plans WHERE user_id = ?",
        [userId]
    );
    return count;
}

module.exports = {
    addMealPlan,
    getMealPlansByUserId,
    deleteMealPlanById,
    deleteMealPlansByUserId,
    getMealPlanCount
};
