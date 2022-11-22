const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET || "secret";
const bcrypt = require("bcryptjs");
const bcrypt_salt_rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

const express = require('express');
const router = express.Router();
const User = require('./user');
const _ = require('lodash');

function createToken(user) {
    return jwt.sign(
        { 
            _id: user._id, 
            nickname: user.nickname
        },
        jwt_secret,
        /*{
            expiresIn: "2h",
        }*/
    )
}

router.post("/register", async (req, res, next) => {
    try {
        // Get user input
        const { nickname, password } = req.body;

        // Validate user input
        if (!nickname || !password) {
            res.status(400).send({ message: "Request must contain fields: 'nickname', 'password'" });
        }

        // check if user already exist
        // Validate if user exist in our database
        let old_user = await User.findOne({ nickname: nickname });
        if (old_user)
            return res.status(409).send({ message: "User with such nickname already exists. If it's yout account, please login instead" });

        // Create user in our database
        const user = await User.create({
            nickname: nickname,
            password: await bcrypt.hash(password, 10)
        });

        // Create token
        const token = createToken(user);

        // save user token
        user.token = token;
        await user.save();

        // return new user
        return res.status(201).send(_.omit(user.toObject(), ["password"]));
    } catch (err) {
        console.error("register\n" + err.message || err);
        next(err);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        // Get user input
        const { nickname, password } = req.body;

        // Validate user input
        if (!nickname || !password) {
            res.status(400).send({ message: "Request must contain fields: 'nickname', 'password'" });
        }
        // Validate if user exist in our database
        const user = await User.findOne({ nickname: nickname });

        if (!user || !(await bcrypt.compare(password, user.password))) 
            res.status(401).send({ message: "Invalid Credentials" });

        // Create token
        const token = createToken(user);

        // save user token
        user.token = token;
        await user.save();

        return res.status(200).send(_.omit(user.toObject(), ["password"]));
    } catch (err) {
        console.error("login\n" + err.message || err);
        next(err);
    }
});

module.exports = router;