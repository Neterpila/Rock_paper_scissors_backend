const bcrypt = require("bcryptjs");
const bcrypt_salt_rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

const express = require('express');
const router = express.Router();
const User = require('./user');
const _ = require('lodash');

function tokenPayload(user) {
    return {
        "iss": "https://github.com/Neterpila/Rock_paper_scissors_backend",
        "sub": user.username
    }
}

router.post("/register", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ message: "Request must contain fields: 'username', 'password'" });
        }

        let old_user = await User.findOne({ username: username });
        if (old_user)
            return res.status(409).send({ message: "User with such username already exists. If it's your account, please login instead" });

        const user = await User.create({
            username: username,
            password: await bcrypt.hash(password, bcrypt_salt_rounds)
        });
        await user.save();

        return res.status(201).send({
            user: _.omit(user.toObject(), ["password"]),
            access_token: tokenPayload(user)
        });
    } catch (err) {
        console.error("register\n" + err.message || err);
        next(err);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ message: "Request must contain fields: 'username', 'password'" });
        }

        const user = await User.findOne({ username: username });
        if (!user || !(await bcrypt.compare(password, user.password))) 
            return res.status(401).send({ message: "Provided username and password are invalid" });

        return res.status(200).send({
            access_token: tokenPayload(user)
        });
    } catch (err) {
        console.error("login\n" + err.message || err);
        next(err);
    }
});

module.exports = router;