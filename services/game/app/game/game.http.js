const express = require('express');
const router = express.Router();
const gameService = require('./game.service');
const _ = require('lodash');

router.post("/", create);
router.get("/", get);

async function create(req, res, next) {

    try {

        return res.status(201).send(await gameService.create(req.body.roundLimit));
    } catch (e) {
        console.error("game | create:\n" + e.message || e);
        next(e);
    }
}

async function get(req, res, next) {
    try {
        return res.status(200).send(await gameService.get());
    } catch (e) {
        console.error("game | get:\n" + e.message || e);
        next(e);
    }
}





module.exports = router;