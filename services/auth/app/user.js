const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema ({
    username: { type: String, unique: true },
    password: { type: String }
});

User.index({ username: "text" });

module.exports = mongoose.model("User", User);