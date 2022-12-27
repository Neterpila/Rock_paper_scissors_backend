const _ = require('lodash');

function parse(req, res, next) {
    if (!_.has(req.headers, "user")) 
        return next();

    try {
        req.user = JSON.parse(req.headers.user)
    } catch (e) {
        console.error("user_parser | user data received in headers is not a valid json:\n" + req.headers.user);
    };
    
    return next();
};

module.exports = parse;