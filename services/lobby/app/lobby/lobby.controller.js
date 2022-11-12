const express = require('express');
const router = express.Router();
const lobbyService = require('./lobby.service');
const _ = require('lodash');

router.post("/create", create);
router.get("/get", get);
router.post("/join", join);

async function create(req, res, next) {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    try {
        return res.status(201).send(await lobbyService.create(req.body));
    } catch (e) {
        if (e.type)
            switch(e.type) {
                case "invalid_data":
                    return res.status(400).send({message: "Data is invalid. Body must include a required 'name' field and an optional 'password' field."});
                default:
            }
        console.error("lobby | create:\n" + e.message || e);
        next(e);
    }
}

async function get(req, res, next) {
    try {
        return res.status(200).send(await lobbyService.get());
    } catch (e) {
        console.error("lobby | get:\n" + e.message || e);
        next(e);
    }
}

async function join(req, res, next) {
    try {
        if (!_.has(req, "body.lobby_id") || 
            !_.has(req, "body.user_id"))
            return res.status(400).send({ message: "Body must include fields 'lobby_id' and 'user_id'" });

        return res.status(200).send(await lobbyService.join(req.body.lobby_id, req.body.user_id));
    } catch (e) {
        if (e.type)
            switch(e.type) {
                case "lobby_does_not_exist":
                    return res.status(400).send({ message: "Lobby with id " + req.body.lobby_id + " does not exist" });
                case "lobby_full":
                    return res.status(409).send({ message: "Lobby " + req.body.lobby_id + "is already full" });
                default:
            }
        console.error("lobby | join:\n" + e.message || e);
        next(e);
    }
}

module.exports = router;