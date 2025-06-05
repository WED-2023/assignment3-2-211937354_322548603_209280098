const DButils = require("../utils/DButils");

async function verifyLogin(req, res, next) {
    try {
        if (!req.session || !req.session.user_id) {
            return res.sendStatus(401);
        }

        const query = "SELECT 1 FROM users WHERE user_id = ?";
        const [result] = await DButils.execQuery(query, [req.session.user_id]);

        if (result) {
            req.user_id = req.session.user_id;
            next();
        } else {
            res.sendStatus(401);
        }
    } catch (err) {
        next(err);
    }
}

module.exports = verifyLogin;
