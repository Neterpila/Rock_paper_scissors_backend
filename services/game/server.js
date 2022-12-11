var express = require('express');
var socket = require('socket.io');

class Player {
    constructor(roomNumber,no) {
        this.roomNumber = roomNumber;
        this.no = no;
        this.score = 0;
        this.yourTurn = true;
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
Player[] players = new Player[10000];

var io = socket(server);
io.on('connection',(socket) => {

    console.log('Made socket connection',socket.id);
    clientNumber++;
    roomNumber=Math.round(clientNumber/2);
    console.log('New client no.: ' + clientNumber + ' room no.: ' + roomNumber);
    socket.join(roomNumber);



    if(clientNumber % 2 === 1){
        players[clientNumber] = new Player(roomNumber,1);
        socket.emit('serverMsg',roomNumber,clientNumber,1);
    }
    else if (clientNumber % 2 === 0){
        players[clientNumber] = new Player(roomNumber,2);
        socket.emit('serverMsg',roomNumber,clientNumber,2);
    }

    console.log(players);

    //Listen for button press
    socket.on('communicat',(decision,roomNumber,clientNumber) => {
        var moveMade = 0;

        //Check if player had made a move if he did, server no longer emit's
        if(players[clientNumber].yourTurn==true){
            io.to(roomNumber).emit('communicat',decision,players[clientNumber].no);
            players[clientNumber].yourTurn=false;
        }
        else {
                         console.log("Wait for your turn move made " + moveMade);
        }

        //Check if both player made a move - I Know it's terrible Might use  interval function for whole serice. Then send communicat about ability to make new move
        console.log("Check if both Player made a move");

//        players.forEach(function(player, index) {
//        if ((player.roomNumber == roomNumber) && (player.yourTurn==false)) {
//            console.log("im inside " + Player.roomNumber + Player.yourTurn);
//            moveMade++;
//            }
//        });
        for(var Player in players) {
            if((Player.roomNumber == roomNumber) && (Player.yourTurn==false)) {
                console.log("im inside " + Player.roomNumber + Player.yourTurn);
                moveMade++;
            }
        }


        if(moveMade>=2) {
            for(var Player in players) {
                if(Player.roomNumber == roomNumber) {
                    Player.yourTurn==true;
                }
            }
        }
    });



});




