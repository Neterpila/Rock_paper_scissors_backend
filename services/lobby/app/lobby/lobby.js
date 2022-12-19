const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Lobby = new Schema ({
    name: { type: String, required: true },
    password: { type: String },
    users: [ {
        username: { type: String },
        is_ready: { type: Boolean, default: false }
    } ],
    owner: { type: String, required: true }
});
Lobby.index({
    name: "text"
}); 

module.exports = mongoose.model('Lobby', Lobby);