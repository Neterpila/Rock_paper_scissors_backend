const express = require('express');
const router = express.Router();
const axios = require("axios");
const validator = require("../auth/jwt_validator");
const fs = require("fs");
const _ = require("lodash");

let config;
try {
    config = fs.readFileSync(__dirname + "/config.json");
    config = JSON.parse(config);
} catch (e) {
    throw new Error("proxy | http config file does not exist or is not valid");
}

config.endpoints.forEach(endpoint => {
    let hosts = {
        lobby: process.env.LOBBY_SERVICE_HOSTNAME,
        game: process.env.GAME_SERVICE_HOSTNAME,
        auth: process.env.AUTH_SERVICE_HOSTNAME
    };
    _.keys(hosts).forEach(key => {
        endpoint.backend.host = endpoint.backend.host.replace(`{${key}}`, hosts[key]);
    });
});

config.endpoints.forEach(endpoint => {
    router[endpoint.method](endpoint.endpoint, async (req, res, next) => 
        handleRequest(endpoint.backend, endpoint.requires_auth, req, res, next));
});

async function handleRequest(backend, requires_auth, req, res, next) {
    let user;
    if (requires_auth) {
        try {
            user = await validator(req.headers.authorization);
        } catch (e) {
            return res.status(401).send({ message: e.message || "Could not validate token" });
        }
    }

    let response;
    try {
        let headers = {};
        if (user)
            headers.user = JSON.stringify(user);

        let req_options = {
            headers,
            params: req.query,
            timeout: config.backend_timeout
        };
        switch(backend.method) {
            // no body can be sent in get method
            case "get":
                response = await axios[backend.method](backend.host + backend.endpoint, req_options);
                break;
            // in post and patch body must be sent using a separate arg
            case "post":
            case "patch":
                response = await axios[backend.method](backend.host + backend.endpoint, req.body, req_options);
                break;
            // delete in axios does not support request body as an arg
            // so 'data' field in options must be used
            case "delete":
                req_options.data = req.body;
                response = await axios[backend.method](backend.host + backend.endpoint, req_options);
                break;
            default:
                throw new Error("proxy | unsupported backend method: " + backend.method);
        }
    } catch (e) {
        if (!e.response) {
            console.error("proxy | could not send request to backend:\n" +
                JSON.stringify(backend) + 
                "\nwhile proxying request:\n" + 
                req.method + " " + req.originalUrl +
                "\nbecause:\n" +
                e.stack || e.message || e.cause || e);
            return res.status(500).send({ message: "Sorry, something went wrong on the backend" });
        }

        return res.status(e.response.status).send(e.response.data);
    }

    return res.status(response.status).send(response.data);
}

module.exports = router;