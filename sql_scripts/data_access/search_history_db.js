// This module manages the 'search_history' table in the database.
// It tracks the user's most recent search query only.

const db = require("../db_connection");


// Inserts a new search query after deleting the previous one (if exists)
async function addSearchEntry(userId, searchQuery, cuisine, diet, intolerance, limit = 5) {
    // Delete any previous search by this user
    await db.execute(
        "DELETE FROM search_history WHERE user_id = ?",
        [userId]
    );

    // Insert the new search record
    const query = `
        INSERT INTO search_history (
            user_id, search_query, cuisine_filter, diet_filter, intolerance_filter, results_limit
        ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.execute(query, [userId, searchQuery, cuisine, diet, intolerance, limit]);
}

// Retrieves the user's most recent search query (if exists)
async function getSearchHistoryByUser(userId) {
    const [rows] = await db.execute(
        `SELECT * FROM search_history
         WHERE user_id = ?
         ORDER BY searched_at DESC
         LIMIT 1`,
        [userId]
    );
    return rows[0]; // returns undefined if no results
}

// Manually clear the search history of a user (used on logout or forced reset)
async function deleteSearchHistoryByUser(userId) {
    await db.execute("DELETE FROM search_history WHERE user_id = ?", [userId]);
}

module.exports = {
    addSearchEntry,
    getSearchHistoryByUser,
    deleteSearchHistoryByUser,
};
