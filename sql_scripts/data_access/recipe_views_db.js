// This module provides access to the 'recipe_views' table.
// It handles tracking of recipe views and ensures only the latest 3 are stored per user.

const db = require("../db_connection");

/**
 * Inserts a new view record for a user and recipe (spoonacular or local).
 * Keeps only the latest 3 views by deleting the oldest if needed.
 */
async function addRecipeView(userId, { spoonacularId = null, userRecipeId = null, familyRecipeId = null }) {
    // Step 1: Check if view already exists for this recipe
    const [existing] = await db.execute(
        `SELECT view_id FROM recipe_views
         WHERE user_id = ? AND 
               spoonacular_recipe_id <=> ? AND
               user_recipe_id <=> ? AND
               family_recipe_id <=> ?`,
        [userId, spoonacularId, userRecipeId, familyRecipeId]
    );

    if (existing.length > 0) {
        // If exists – update the timestamp to now
        await db.execute(
            `UPDATE recipe_views
             SET viewed_at = CURRENT_TIMESTAMP
             WHERE view_id = ?`,
            [existing[0].view_id]
        );
    } else {
        // Step 2: If 3 or more exist, delete the oldest one
        // const [existingViews] = await db.execute(
        //     `SELECT view_id FROM recipe_views
        //      WHERE user_id = ?
        //      ORDER BY viewed_at ASC`,
        //     [userId]
        // );

        // if (existingViews.length >= 3) {
        //     const oldestViewId = existingViews[0].view_id;
        //     await db.execute("DELETE FROM recipe_views WHERE view_id = ?", [oldestViewId]);
        // }

        // Step 3: Insert the new view
        await db.execute(
            `INSERT INTO recipe_views (user_id, spoonacular_recipe_id, user_recipe_id, family_recipe_id)
             VALUES (?, ?, ?, ?)`,
            [userId, spoonacularId, userRecipeId, familyRecipeId]
        );
    }
}

// async function addRecipeView(userId, { spoonacularId = null, userRecipeId = null, familyRecipeId = null }) {
//     // Step 1: Get all views of the user (ordered by time)
//     const [existingViews] = await db.execute(
//         `SELECT view_id FROM recipe_views
//          WHERE user_id = ?
//          ORDER BY viewed_at ASC`,
//         [userId]
//     );

//     // Step 2: If 3 or more exist, delete the oldest one
//     if (existingViews.length >= 3) {
//         const oldestViewId = existingViews[0].view_id;
//         await db.execute("DELETE FROM recipe_views WHERE view_id = ?", [oldestViewId]);
//     }

//     // Step 3: Insert the new view
//     await db.execute(
//         `INSERT INTO recipe_views (user_id, spoonacular_recipe_id, user_recipe_id, family_recipe_id)
//          VALUES (?, ?, ?, ?)`,
//         [userId, spoonacularId, userRecipeId, familyRecipeId]
//     );
// }

/**
 * Retrieves all view records for a specific user
 */
async function getViewsByUserId(userId) {
    const [rows] = await db.execute(
        "SELECT * FROM recipe_views WHERE user_id = ? ORDER BY viewed_at DESC",
        [userId]
    );
    return rows;
}

/**
 * Deletes all view records for a specific user (used in reset operations)
 */
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
