var express = require('express');
var socket = require('socket.io');

class Player {
    constructor(roomNumber,no) {
        this.roomNumber = roomNumber;
        this.no = no;
        this.score = 0;
        this.yourTurn = false;
    }

    addPoint() {
        this.score++;
    }
    endOfTurn() {
        this.yourTurn=true;
    }

}

var app = express();
var server = app.listen(3001,function() {
    console.log('GameServer listening for requests on port 3001');
});
 //Can use path module but bruh
app.use(express.static('app'));

let clientNumber = 0;
let roomNumber;
let players= {};

var io = socket(server);
io.on('connection',(socket) => {

    console.log('Made socket connection',socket.id);
    clientNumber++;
    roomNumber=Math.round(clientNumber/2);
    console.log('New client no.: ' + clientNumber + ' room no.: ' + roomNumber);
    socket.join(roomNumber);
    socket.emit('serverMsg',roomNumber,clientNumber);


    if(clientNumber % 2 === 1){
        players[socket.id] = new Player(roomNumber,1);
    }
    else if (clientNumber % 2 === 0){
        players[socket.id] = new Player(roomNumber,2);
    }

    console.log(players);

    //Listen for button press
    socket.on('communicat',(decision,roomNumber) => {
        var currentRoom = players[socket.id].roomNumber;
        var moveMade = 0;
        //Check if player had made a move if he did, server no longer emit's
        if(players[socket.id].yourTurn==true){
            io.to(roomNumber).emit('communicat',decision);
            players[socket.id].yourTurn=false;
        }

        //Check if both player made a move - I Know it's terrible Might take it to refresh interval function for whole server. send communicat about ability to make new move

        for(var player in players) {
            if(player.roomNumber == currentRoom && player.yourTurn=false) {
                moveMade++;
            }
            if(moveMade==2);
            io.to(roomNumber).emit('enemyDecision',decision);
        }

    });



});




