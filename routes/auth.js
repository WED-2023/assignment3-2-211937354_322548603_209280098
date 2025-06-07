const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const userDB = require("../sql_scripts/data_access/user_db");
const searchHistoryDB = require("../sql_scripts/data_access/search_history_db");

// Username validation function
function validateUsername(username) {
  // 3-8 characters
  if (username.length < 3 || username.length > 8) {
    return false;
  }

  // Only English letters (no numbers, no spaces, no special characters)
  if (!/^[A-Za-z]+$/.test(username)) {
    return false;
  }

  return true;
}

// Password validation function
function validatePassword(password) {
  // 5-10 characters
  if (password.length < 5 || password.length > 10) {
    return false;
  }

  // At least one number
  if (!/\d/.test(password)) {
    return false;
  }

  // At least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return false;
  }

  return true;
}

// ======================= REGISTER =======================
router.post("/register", async (req, res, next) => {
  try {
    const { username, firstName, lastName, country, email, password } = req.body;

    // Validate required fields
    if (!username || !firstName || !lastName || !country || !email || !password) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Validate username requirements
    if (!validateUsername(username)) {
      return res.status(400).send({
        message: "Username must be 3-8 characters long and contain only English letters"
      });
    }

    // Validate password requirements
    if (!validatePassword(password)) {
      return res.status(400).send({
        message: "Password must be 5-10 characters long, contain at least one number and one special character"
      });
    }

    // Check if username already exists
    const existingUser = await userDB.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).send({ message: "Username already exists" });
    }

    // Hash the password
    const passwordHash = bcrypt.hashSync(password, parseInt(process.env.BCRYPT_ROUNDS));

    // Save the user
    await userDB.createUser(username, firstName, lastName, country, email, passwordHash);

    res.status(201).send({ message: "User registered successfully", success: true });
  } catch (err) {
    next(err);
  }
});

// ======================== LOGIN =========================
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
      return res.status(400).send({ message: "Username and password are required" });
    }

    // Retrieve user from DB
    const user = await userDB.getUserByUsername(username);

    if (!user) {
      return res.status(401).send({ message: "Invalid username or password" });
    }

    if (!user.hashedPassword || !bcrypt.compareSync(password, user.hashedPassword)) {
      return res.status(401).send({ message: "Invalid username or password" });
    }

    // Start session
    req.session.user_id = user.user_id;

    // Set login cookie
    res.cookie("login", "true", {
      sameSite: "none",
      secure: true,
    });

    res.status(200).send({ message: "Login successful", success: true });
  } catch (err) {
    next(err);
  }
});


// ======================== LOGOUT ========================
router.post("/logout", async (req, res, next) => {
  try {
    const userId = req.session.user_id;

    // Clear search history of the user (according to system spec)
    await searchHistoryDB.deleteSearchHistoryByUser(userId);

    // Clear session and cookies
    req.session.reset();
    res.clearCookie("login");

    res.send({ message: "Logout successful", success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;