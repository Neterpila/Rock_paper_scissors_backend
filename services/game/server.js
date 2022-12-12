var express = require('express');
var socket = require('socket.io');
var player = require("./app/player.js");
var players = require("./app/players.js");


var app = express();
var server = app.listen(3001,function() {
    console.log('GameServer listening for requests on port 3001');
});
 //Can use path module but bruh
app.use(express.static('app'));

let clientNumber = 0;
let roomNumber;
const playersTable = new players();

var io = socket(server);
io.on('connection',(socket) => {

    console.log('Made socket connection',socket.id);
    roomNumber=Math.floor(clientNumber/2);
    console.log('New client no.: ' + clientNumber + ' room no.: ' + roomNumber);
    socket.join(roomNumber);

    const clientOrder = clientNumber % 2 === 1 ? 2 : 1;
    playersTable.newPlayer(roomNumber,clientOrder,socket.id);
    socket.emit('serverMsg',roomNumber,clientNumber,clientOrder);
    clientNumber++;
//
//    if(clientNumber % 2 === 1){
//        playersTable.newPlayer(roomNumber,1);
//        socket.emit('serverMsg',roomNumber,clientNumber,1);
//    }
//    else if (clientNumber % 2 === 0){
//        playersTable.newPlayer(roomNumber,2);
//        socket.emit('serverMsg',roomNumber,clientNumber,2);
//    }

    console.log(playersTable);

    //Listen for button press
    socket.on('makeMove',(decision,roomNumber,clientNumber) => {
//        var moveMade = 0;

        //Check if player had made a move if he did, server no longer emit's
        const player = playersTable.getPlayer(clientNumber);

        const opponent = playersTable.getOpponent(clientNumber);
        if(player.choice===""){
            player.choice=decision
//          io.to(roomNumber).emit('communicat',decision,playersTable.getPlayer(clientNumber).no);
        }
        else {
            console.log("Wait for your turn !");
        }

        //Check if both player made a move - I Know it's terrible Might use  interval function for whole serice. Then send communicat about ability to make new move
        console.log("SOMEBODY MADE A MOVE");
        if(opponent.choice !== ""){
            let winner = null;
            if(player.choice === "paper" && opponent.choice === "rock") winner = player;
            if(player.choice === "paper" && opponent.choice === "scissors") winner = opponent;
            if(player.choice === "rock" && opponent.choice === "paper") winner = opponent;
            if(player.choice === "rock" && opponent.choice === "scissors") winner = player;
            if(player.choice === "scissors" && opponent.choice === "paper") winner = player;
            if(player.choice === "scissors" && opponent.choice === "rock") winner = opponent;
            if(winner === null){
                io.to(roomNumber).emit("stateUpdate", {
                    you: player.choice,
                    opponent: opponent.choice,
                    youScore: player.score,
                    opponentScore: opponent.score,
                    message: "It's a draw!"
                })
            } else {
                winner.score += 1
                const loser = winner === player ? opponent : winner;
                io.to(winner.sid).emit("stateUpdate", {
                    you: winner.choice,
                    opponent: loser.choice,
                    youScore: winner.score,
                    opponentScore: loser.score,
                    message: "You win!"
                })
                io.to(loser.sid).emit("stateUpdate", {
                    you: loser.choice,
                    opponent: winner.choice,
                    youScore: loser.score,
                    opponentScore: winner.score,
                    message: "You lose round: " + playersTable.rounds.get(roomNumber) + " :c "
                })
            }
            //reset
            player.choice="";
            opponent.choice="";
            //round++
            playersTable.rounds.set(roomNumber,playersTable.rounds.get(roomNumber)+1);





        }
    });



});




