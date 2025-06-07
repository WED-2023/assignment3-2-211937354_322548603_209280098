const express = require("express");
const app = express();
const cors = require("cors");
const session = require("client-sessions");
const DButils = require("./sql scripts/db_connection");

// Middleware
app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(
    session({
        cookieName: "session",
        secret: "template",     //secret: process.env.COOKIE_SECRET,
        duration: 24 * 60 * 60 * 1000,
        activeDuration: 1000 * 60 * 5,
        cookie: {
            httpOnly: false,
        }
    })
);

// Middleware to extract user_id from session if valid
app.use(async function (req, res, next) {
    if (req.session && req.session.user_id) {
        try {
            const users = await DButils.execQuery("SELECT user_id FROM users");
            if (users.find((x) => x.user_id === req.session.user_id)) {
                req.user_id = req.session.user_id;
            }
        } catch (err) {
            // Optionally log error
        }
    }
    next();
});

// Route files
const user = require("./routes/user");
const recipes = require("./routes/recipes");
const auth = require("./routes/auth");
const spoonacular = require("./routes/API_spooncular/spooncular");

app.use("/api/users", user);
app.use("/api/recipes", recipes);
app.use("/api/auth", auth);
app.use("/api/spoonacular", spoonacular);

// Alive check
app.get("/alive", (req, res) => {
    res.send("I'm alive");
});

module.exports = app;
