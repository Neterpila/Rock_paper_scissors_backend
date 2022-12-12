var player = require("./player.js");


// Class that holds a collection of players and properties and functions for the group
module.exports = class Players {
  constructor(){
    this.players = [];
    this.rounds = new Map();
  }
  // create a new player and save it in the collection
  newPlayer(roomNumber,no,sid){
    let p = new player(roomNumber,no,sid)
    this.players.push(p)
    this.rounds.set(roomNumber,1);
  }
  get allPlayers(){
    return this.players
  }
  getOpponent(id){
    return this.players[id % 2 === 0 ? id + 1 : id - 1]
  }
  getPlayer(id){
    return this.players[id]
  }
  // this could include summary stats like average score, etc. For simplicy, just the count for now
  get numberOfPlayers(){
      return this.players.length
  }
};