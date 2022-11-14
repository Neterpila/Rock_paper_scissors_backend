const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema ({
    nickname: { type: String, unique: true },
    password: { type: String },
    token: { type: String }
});

module.exports = mongoose.model("User", User);