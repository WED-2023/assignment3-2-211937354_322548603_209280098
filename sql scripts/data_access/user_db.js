// This module provides dynamic access to the 'users' table in our MySQL database.
// It supports operations such as create, retrieve, and delete users, using input from the system.


const db = require("../db_connection");

// Create a new user
async function createUser(username, firstName, lastName, country, email, passwordHash) {
    const query = `
        INSERT INTO users (username, first_name, last_name, country, email, hashedPassword)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.execute(query, [username, firstName, lastName, country, email, passwordHash]);
}
// Get user by email (for login / verification)
async function getUserByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
}

// Get user by username
async function getUserByUsername(username) {
    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
    return rows[0];
}

async function getPasswordHash(username) {
    const [rows] = await db.execute(
        "SELECT hashedPassword FROM users WHERE username = ?",
        [username]
    );
    return rows[0]?.password_hash;
}

// Get user by ID (general retrieval)
async function getUserById(userId) {
    const [rows] = await db.execute("SELECT * FROM users WHERE user_id = ?", [userId]);
    return rows[0];
}

// Delete user by ID
async function deleteUserById(userId) {
    await db.execute("DELETE FROM users WHERE user_id = ?", [userId]);
}

// Update user details (by ID)
async function updateUserById(userId, updates) {
    const { username, firstName, lastName, country, email, passwordHash } = updates;
    const query = `
        UPDATE users
        SET username = ?, first_name = ?, last_name = ?, country = ?, email = ?, hashedPassword = ?
        WHERE user_id = ?
    `;
    await db.execute(query, [username, firstName, lastName, country, email, passwordHash, userId]);
}

module.exports = {
    getPasswordHash,
    createUser,
    getUserByEmail,
    getUserByUsername,
    getUserById,
    updateUserById,
    deleteUserById,
};
