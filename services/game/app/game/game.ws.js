const express = require('express');
const expressWs = require('express-ws')(express);
const router = express.Router();
const gameService = require('./game.service');
const _ = require('lodash');
const game = require('./game');
const debug_log = process.env.DEBUG_LOG === "true";

gameService.clearConnectedUsers();


router.ws("/game", (connection, req) => {
    console.log("Gateway successfully opened a WebSocket connection");

    connection.on('close', () => console.log('Gateway disconnected!'));

    connection.on("message", async message => {
        message = JSON.parse(message);
        debug_log && console.log("Received message from gateway: \n" + JSON.stringify(message, null, "  "));
        const user = message.user;
        
        debug_log && console.log(`Processing the ${message.event} event of ${user.username}...`);
        try {
            switch(message.event) {
                case "open":
                    return await join_game(connection, message.params.game_id, user);
                case "close":
                    return await leave_game(connection, message.params.game_id, user);
                case "message":
                    return await makeMove(connection, message.params.game_id,message.data, user);
                default: 
                    console.error("ws | unknown gateway event: " + message.event + ". Event ignored");
            }
        } catch (e) {
            console.error(`ws | ${message.event} event | unexpected error occured:\n` + e.message || e.stack || e);
            return connection.send(JSON.stringify({
                action: "close",
                user
            }));
        }
    });
});



async function makeMove(connection, gameId,message, user) {

    playerUsername = user.username
    let connected_users = await gameService.getConnectedUsers(gameId);
    let player = connected_users.filter(player => {
        return player.username === playerUsername
    })[0];
    let opponent = _.filter(connected_users, function(u) { 
        if (u.username != playerUsername) return u; 
     })[0];

    var message = await JSON.parse(message);
    choiceValid = await gameService.validateChoice(message.choice);
    if( !choiceValid ) {
        console.log("UNVALID CHOISE!!");
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: player.username
            },
            data: JSON.stringify({
                event: "UnvalidChoice",
                playerChoice: player.choice,
            })
        }));
        return;
    }

    if(player.yourTurn === false) {
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: player.username
            },
            data: JSON.stringify({
                event: "Move_already_made",
                playerChoice: player.choice,
            })
        }));
        return;
    }
    
    console.log("choice is " + message.choice);
    
    player = await gameService.saveChoiceAndMakeTurn(player.username,gameId,message.choice);

    currRound = await gameService.getCurrentRound(gameId);


    if (opponent.choice !== "") {
        let winner = null;
        if (player.choice === "paper" && opponent.choice === "rock") winner = player;
        if (player.choice === "paper" && opponent.choice === "scissors") winner = opponent;
        if (player.choice === "rock" && opponent.choice === "paper") winner = opponent;
        if (player.choice === "rock" && opponent.choice === "scissors") winner = player;
        if (player.choice === "scissors" && opponent.choice === "paper") winner = player;
        if (player.choice === "scissors" && opponent.choice === "rock") winner = opponent;
        if (winner === null) {

            connection.send(JSON.stringify({
                action: "send",
                user: {
                    username: player.username
                },
                data: JSON.stringify({
                    event: "roundEnded",
                    state: "draw",
                    opponentChoice: opponent.choice,
                    score: player.score + " : " + opponent.score,
                    currentRound: currRound
                })
            }));
            connection.send(JSON.stringify({
                action: "send",
                user: {
                    username: opponent.username
                },
                data: JSON.stringify({
                    event: "roundEnded",
                    state: "draw",
                    opponentChoice: player.choice,
                    score: opponent.score + " : " + player.score,
                    currentRound: currRound
                })
            }));
            
            gameService.endTurn(gameId);
            gameService.addRound(gameId);
        } else {
            winner = await gameService.addPoint(gameId,winner.username);
            let loser = winner.username === player.username ? opponent : player;

            gameService.endTurn(gameId)

            connection.send(JSON.stringify({
                action: "send",
                user: {
                    username: winner.username
                },
                data: JSON.stringify({
                    event: "roundEnded",
                    state: "win",
                    opponentChoice: loser.choice,
                    score: winner.score + " : " + loser.score,
                    currentRound: currRound
                })
            }));
            
            connection.send(JSON.stringify({
                action: "send",
                user: {
                    username: loser.username
                },
                data: JSON.stringify({
                    event: "roundEnded",
                    state: "lose",
                    opponentChoice: winner.choice,
                    score: loser.score + " : " + winner.score ,
                    currentRound: currRound
                })
            }));
            //TODO check if gameEnded 
            //TODO save gameHistory
            
            if(gameService.getCurrentRound(gameId.valueOf()) >= gameService.getRoundLimit(gameId.valueOf())) {
                console.log("Game ended !");
            }
            gameService.addRound(gameId);
        } 
    } else {
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: player.username
            },
            data: JSON.stringify({
                event: "Move_made",
                playerChoice: player.choice,
            })
        }));
        return;
    }
};


async function join_game(connection, id, user) {
    try {
        //attempt to save the info about newly connected user to db
        await gameService.join(id, user);
    } catch (e) {
        switch (e.type) {
            case "does_not_exist":
                return connection.send(JSON.stringify({
                    action: "close",
                    user,
                    status: 4000,
                    reason: "game with id " + id + " does not exist"
                }));
            case "game_full":
                return connection.send(JSON.stringify({
                    action: "close",
                    user,
                    status: 4001,
                    reason: "game " + id + " is already full"
                }));
            default:
                throw e;
        }
    }

    //getting all currently connected users to the game
    //except the newly connected user
    let users = await gameService.getConnectedUsers(id); //this returns an array of usernames
    users = _.filter(users, u => u.username !== user.username);

    //broadcast the new user connection event to every other user in game
    users.forEach(u => {
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: u.username
            },
            data: JSON.stringify({
                event: "user_connected",
                user
            })
        }));
    });
    return;
}

async function leave_game(connection, id, user) {
    //attempt to save the info about disconnected user to db
    await gameService.leave(id, user.username);

    //getting all currently connected users to the game
    let users = await gameService.getConnectedUsers(id);

    //broadcast the user disconnected event to every remaining user in game
    users.forEach(u => {
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: u.username
            },
            data: JSON.stringify({
                event: "user_disconnected",
                user
            })
        }));
    });
    return;


}

module.exports = router;
