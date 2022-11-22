const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET || "secret";

async function validate(req, res, next) {
    const token =
    req.body.token || req.query.token || req.headers["x-access-token"] || req.headers.authorization;
    if (!token)
        return res.status(401).send({ message: "A token is required for authentication"} );

    try {
        const decoded = jwt.verify(token, jwt_secret);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send({ message: "Invalid Token" });
    }
    return next();
};

module.exports = validate;