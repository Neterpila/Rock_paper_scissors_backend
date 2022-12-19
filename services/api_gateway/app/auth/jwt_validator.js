const axios = require("axios");
const _ = require("lodash");

async function validateToken(token) {
    if (!token)
        throw new Error("Token is not present");

    token = token.replace(/^Bearer\s+/, "");
    let response;
    try {
        response = await axios.get("http://auth:3002/validate", {
            params: {
                token
            }
        });
    } catch (e) {
        if (!e.response) {
            console.error("validator | could not send request to Auth Service to validate token:\n" +
                e.stack || e.message || e.cause || e);
            throw new Error("", { cause: e });
        }

        if (e.response.status === 400) 
            throw new Error((e.response.data && e.response.data.message) ? e.response.data.message : "Token is not valid");

        console.error("validator | unexpected response from Auth Service:\n" + e.response);
        throw new Error("", { cause: e });
    }

    let decoded_token = response.data;
    return {
        username: decoded_token.sub
    };
}

module.exports = validateToken;
