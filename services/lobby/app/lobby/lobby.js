const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Lobby = new Schema ({
    name: { type: String, required: true },
    password: { type: String },
    players: [ String ]
});
Lobby.index({
    name: "text"
}); 

module.exports = mongoose.model('Lobby', Lobby);