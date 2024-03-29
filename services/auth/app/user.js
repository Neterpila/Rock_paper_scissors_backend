const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema ({
    username: { type: String },
    password: { type: String }
});

User.index({ username: "text" }, { unique: true });

module.exports = mongoose.model("User", User);