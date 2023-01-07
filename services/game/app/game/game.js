const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Game = new Schema ({
    
    roundLimit : {type: Number},
    currentRound: {type: Number , default: 1},
    users: [ {
        username: { type: String },
        yourTurn: { type: Boolean, default: true },
        score:    {type: Number, default: 0},
        choice: {type: String, default: ""}
    } ]

});


module.exports = mongoose.model('Game', Game);