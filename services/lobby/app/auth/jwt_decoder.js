const jwt_decode = require('jwt-decode');
const _ = require('lodash');

async function decode(req, res, next) {
    if (!_.has(req.headers, "authorization")) 
        return next();

    let token = req.headers.authorization.replace(/^Bearer\s+/, "");
    try {
        token = jwt_decode(token);
        if (!_.has(token, "sub"))
            throw {
                message: "No sub key in jwt token"
            }
    } catch (e) {
        console.error("decode\n" + e.message || e);
        return next();
    }

    req.user = {
        username: token.sub
    };
    return next();
};

module.exports = decode;