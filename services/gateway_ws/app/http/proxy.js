const express = require('express');
const router = express.Router();
const axios = require("axios");
const validator = require("../auth/jwt_validator");
const util = require('util');

const config = {
    endpoints: [{
        "endpoint": "/lobby",
        "method": "get",
        "backend": {
            "endpoint": "/lobby",
            "method": "get",
            "host": "http://lobby:3000"
        },
        "requires_auth": false
    }, {
        "endpoint": "/lobby",
        "method": "post",
        "backend": {
            "endpoint": "/lobby/",
            "method": "post",
            "host": "http://lobby:3000"
        },
        "requires_auth": true
    }, {
        "endpoint": "/lobby",
        "method": "delete",
        "backend": {
            "endpoint": "/lobby",
            "method": "delete",
            "host": "http://lobby:3000"
        },
        "requires_auth": true
    }, {
        "endpoint": "/register",
        "method": "post",
        "backend": {
            "endpoint": "/register",
            "method": "post",
            "host": "http://auth:3002"
        },
        "requires_auth": false
    }, {
        "endpoint": "/login",
        "method": "post",
        "backend": {
            "endpoint": "/login",
            "method": "post",
            "host": "http://auth:3002"
        },
        "requires_auth": false
    }],
    backend_timeout: 1500
}

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

        response = await axios[backend.method](backend.host + backend.endpoint,
            req.body,
            {
                headers,
                params: req.query,
                timeout: config.backend_timeout
            }    
        );
    } catch (e) {
        if (!e.response) {
            console.error("proxy | could not send request to backend:\n" +
                JSON.stringify(backend) + 
                "\nwhile proxying request:\n" + 
                util.inspect(req) +
                "\nbecause:\n" +
                e.stack || e.message || e.cause || e);
            return res.status(500).send({ message: "Sorry, something went wrong on the backend" });
        }

        return res.status(e.response.status).send(e.response.data);
    }

    return res.status(response.status).send(response.data);
}

module.exports = router;