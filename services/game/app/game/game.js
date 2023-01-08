const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Game = new Schema ({
    
    roundLimit : {type: Number, default: 10},
    currentRound: {type: Number , default: 1},
    users: [ {
        username: { type: String },
        yourTurn: { type: Boolean, default: true },
        score:    {type: Number, default: 0},
        choice: {type: String, default: ""}
    } ],

    gameHistory: [ {
        round : { type: String},
        winner: {type: String, default: "draw"}
    } ],

    winnerOfGame: {type:String, default: "draw"}

});


module.exports = mongoose.model('Game', Game);