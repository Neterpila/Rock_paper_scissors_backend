const jwt = require("jsonwebtoken");
const { setupCache } = require("axios-cache-interceptor");
const axios = setupCache(require("axios"));
const _ = require("lodash");

async function validateToken(token, kid = "sim1") {
    let response;
    try {
        response = (await axios.get("http://auth:3002/jwk", {
            id: 'jwk',
            cache: {
              ttl: 1000 * 60 * 3
            }
          })).data;
    } catch (e) {
        console.error("Could not get jwt:\n" + e.message || e.stack || e);
        throw new Error("Could not get jwt to verify the token", { cause: e });
    }
    let key = _.find(response.keys, {
        kid: kid
    }).k;

    token = token.replace(/^Bearer\s+/, "");
    let decoded_token;
    try {
        decoded_token = jwt.verify(token, Buffer.from(key, 'base64').toString());
    } catch (e) {
        throw new Error("Could not decode token", { cause: e });
    }
    return {
        username: decoded_token.sub
    };
}

module.exports = validateToken;
