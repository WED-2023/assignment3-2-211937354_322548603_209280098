// This module manages the 'search_history' table in the database.
// It tracks previous user search queries, filters, and timestamps.

const db = require("../db_connection");

// Insert a new search history record for a user
async function addSearchEntry(userId, searchQuery, cuisine, diet, intolerance, limit = 5) {
    const query = `
        INSERT INTO search_history (
            user_id, search_query, cuisine_filter, diet_filter, intolerance_filter, results_limit
        ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.execute(query, [userId, searchQuery, cuisine, diet, intolerance, limit]);
}

// Get all search history records for a specific user
async function getSearchHistoryByUser(userId) {
    const [rows] = await db.execute(
        "SELECT * FROM search_history WHERE user_id = ? ORDER BY searched_at DESC",
        [userId]
    );
    return rows;
}

// Delete all search history for a specific user
async function deleteSearchHistoryByUser(userId) {
    await db.execute("DELETE FROM search_history WHERE user_id = ?", [userId]);
}

module.exports = {
    addSearchEntry,
    getSearchHistoryByUser,
    deleteSearchHistoryByUser,
};
