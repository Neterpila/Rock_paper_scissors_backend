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
                    return await processClientMessage(connection, message.params.game_id,message.data, user);
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

async function processClientMessage(connection, gameId, message, user) {
    //if the client message is not a json or is not a move - then ignore
    try {
        message = JSON.parse(message);
    } catch (e) {};
    if (message.action === "move" && message.data)
        await makeMove(connection, gameId, message.data.move, user);
}

async function makeMove(connection, gameId, move, user) {
    if ((await gameService.findById(gameId)).ended){
        //console.log("Game is Closed, Create New One");
        return connection.send(JSON.stringify({
            action: "close",
            user,
            status: 4002,
            reason: "game " + gameId + " already ended"
        }));
    }

    if (!(await gameService.validateChoice(move))) {
        //console.log("UNVALID CHOISE!!");
        connection.send(JSON.stringify({
            action: "send",
            user,
            data: JSON.stringify({
                event: "invalid_move"
            })
        }));
        return;
    }

    let player = _.find((await gameService.getConnectedUsers(gameId)), u => u.username === user.username);

    if (player.yourTurn === false) {
        return connection.send(JSON.stringify({
            action: "send",
            user: {
                username: player.username
            },
            data: JSON.stringify({
                event: "move_already_made",
                data: {
                    move: player.choice
                }
            })
        }));
    }

    player = await gameService.saveChoiceAndMakeTurn(player.username, gameId, move);
    
    //console.log("choice is " + move);

    let opponent = _.find((await gameService.getConnectedUsers(gameId)), u => u.username != player.username);
    /*if (!opponent) {
        return connection.send(JSON.stringify({
            action: "send",
            user,
            data: JSON.stringify({
                event: "opponent_missing",
                message: "Opponent has not yet joined the game, please wait"
            })
        }));
    }*/

    if (!opponent || !opponent.choice)
        return connection.send(JSON.stringify({
            action: "send",
            user: {
                username: player.username
            },
            data: JSON.stringify({
                event: "move_made",
                data: {
                    move: player.choice
                }
            })
        }));

    let currRound = await gameService.getCurrentRound(gameId);
    
    let winner = null;
    if (player.choice === "paper" && opponent.choice === "rock") winner = player;
    if (player.choice === "paper" && opponent.choice === "scissors") winner = opponent;
    if (player.choice === "rock" && opponent.choice === "paper") winner = opponent;
    if (player.choice === "rock" && opponent.choice === "scissors") winner = player;
    if (player.choice === "scissors" && opponent.choice === "paper") winner = player;
    if (player.choice === "scissors" && opponent.choice === "rock") winner = opponent;

    if (winner === null) {
        gameService.endTurn(gameId,currRound);

        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: player.username
            },
            data: JSON.stringify({
                event: "round_ended",
                data: {
                    state: "draw",
                    opponent_move: opponent.choice,
                    score: player.score + " : " + opponent.score,
                    current_round: currRound
                }
            })
        }));
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: opponent.username
            },
            data: JSON.stringify({
                event: "round_ended",
                data: {
                    state: "draw",
                    opponent_move: player.choice,
                    score: player.score + " : " + opponent.score,
                    current_round: currRound
                }
            })
        }));
    } else {
        winner = await gameService.addPoint(gameId,winner.username);
        let loser = winner.username === player.username ? opponent : player;

        gameService.endTurn(gameId,currRound,winner);

        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: winner.username
            },
            data: JSON.stringify({
                event: "round_ended",
                data: {
                    state: "win",
                    opponent_move: loser.choice,
                    score: winner.score + " : " + loser.score,
                    current_round: currRound
                }
            })
        }));
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: loser.username
            },
            data: JSON.stringify({
                event: "round_ended",
                data: {
                    state: "lose",
                    opponent_move: winner.choice,
                    score: loser.score + " : " + winner.score,
                    current_round: currRound
                }
            })
        }));
    }

    //console.log("pre end: " + currRound + "/" + (await gameService.getRoundLimit(gameId)));

    // if game not yet ended - inc round 
    if (currRound < await gameService.getRoundLimit(gameId))
        return await gameService.addRound(gameId);

    // game ended, send results
    // console.log("game ended");
    connected_users = await gameService.getConnectedUsers(gameId);
    connected_users = _.sortBy(connected_users, user => user.score);
    let game_winner = connected_users[1];
    let game_loser = connected_users[0];

    if (game_winner.score === game_loser.score) {
        [game_winner, game_loser].forEach(p => {
            connection.send(JSON.stringify({
                action: "send",
                user: {
                    username: p.username
                },
                data: JSON.stringify({
                    event: "game_ended",
                    data: {
                        state: "draw",
                        score: `${p.score} : ${p.score}`
                    }
                })
            }));
        });
        await gameService.endGame(gameId, "draw");
    } else {
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: game_loser.username
            },
            data: JSON.stringify({
                event: "game_ended",
                data: {
                    state: "lose",
                    score: `${game_loser.score} : ${game_winner.score}`
                }
            })
        }));
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: game_winner.username
            },
            data: JSON.stringify({
                event: "game_ended",
                data: {
                    state: "win",
                    score: `${game_winner.score} : ${game_loser.score}`
                }
            })
        }));
        await gameService.endGame(gameId, game_winner);
    }
};


async function join_game(connection, id, user) {
    //Check if Game was played 

    if(await gameService.getCurrentRound(id) > await gameService.getRoundLimit(id)){
        //console.log("Game is Closed, Create New One");
        return connection.send(JSON.stringify({
            action: "close",
            user,
            status: 4002,
            reason: "game " + id + " already ended"
        }));
    }

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
