// An individual player. Holds properties and behavior for one player

module.exports = class Player {
  constructor(roomNumber,no,sid) {
          this.roomNumber = roomNumber;
          this.no = no;
          this.score = 0;
          this.choice = "";
          this.sid = sid;
          this.round = 1;
      }
  getTurn(){
    return this.yourTurn;
  }
  getRoomNumber(){
    return this.roomNumber
  }
  setTurn(){
    this.yourTurn = false;
  }
};

