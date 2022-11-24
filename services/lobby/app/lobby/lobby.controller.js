const express = require('express');
const router = express.Router();
const lobbyService = require('./lobby.service');
const _ = require('lodash');

router.post("/", create);
router.delete("/", remove);
router.get("/", get);
router.put("/join", join);
router.put("/leave", leave);

async function create(req, res, next) {
    let { username } = req.user || {};
    console.log(req.body);

    if (!username)
        return res.status(400).send({ message: "No user info was found in the request" });

    try {
        return res.status(201).send(await lobbyService.create(req.body, username));
    } catch (e) {
        if (e.type)
            switch(e.type) {
                case "invalid_data":
                    return res.status(400).send({message: "Body must include a required 'name' field and an optional 'password' field."});
                default:
            }
        console.error("lobby | create:\n" + e.message || e);
        next(e);
    }
}

async function remove(req, res, next) {
    let { username } = req.user || {};
    let { lobby_id } = req.body;
    if (!lobby_id)
        return res.status(400).send({ message: "Body must include 'lobby_id' field" });
    if (!username)
        return res.status(400).send({ message: "No user info was found in the request" });

    try {
        await lobbyService.remove(lobby_id, username);
        return res.status(204).send();
    } catch (e) {
        if (e.type)
            switch(e.type) {
                case "does_not_exist":
                    return res.status(400).send({ message: "Lobby with id " + req.body.lobby_id + " does not exist" });
                case "not_an_owner":
                    return res.status(403).send({ message: "You are not an owner of this lobby" });
                default:
            }
        console.error("lobby | remove:\n" + e.message || e);
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
    let { username } = req.user || {};
    let { lobby_id } = req.body;
    try {
        if (!lobby_id)
            return res.status(400).send({ message: "Body must include 'lobby_id' field" });

        if (!username)
            return res.status(400).send({ message: "No user info was found in the request" });

        return res.status(200).send(await lobbyService.join(lobby_id, username));
    } catch (e) {
        if (e.type)
            switch(e.type) {
                case "does_not_exist":
                    return res.status(400).send({ message: "Lobby with id " + req.body.lobby_id + " does not exist" });
                case "lobby_full":
                    return res.status(409).send({ message: "Lobby " + req.body.lobby_id + "is already full" });
                default:
            }
        console.error("lobby | join:\n" + e.message || e);
        next(e);
    }
}

async function leave(req, res, next) {
    let { username } = req.user || {};
    let { lobby_id } = req.body;
    try {
        if (!lobby_id)
            return res.status(400).send({ message: "Body must include 'lobby_id' field" });

        if (!username)
            return res.status(400).send({ message: "No user info was found in the request" });

        return res.status(200).send(await lobbyService.leave(lobby_id, username));
    } catch (e) {
        if (e.type)
            switch(e.type) {
                case "does_not_exist":
                    return res.status(400).send({ message: "Lobby with id " + req.body.lobby_id + " does not exist" });
                default:
            }
        console.error("lobby | leave:\n" + e.message || e);
        next(e);
    }
}

module.exports = router;