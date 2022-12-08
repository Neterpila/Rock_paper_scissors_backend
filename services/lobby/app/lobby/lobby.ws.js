const express = require('express');
const expressWs = require('express-ws')(express);
const router = express.Router();
const lobbyService = require('./lobby.service');
const _ = require('lodash');

// purge all connected users from db when the server starts
// because data about connected users is not removed from db when the server stops
lobbyService.clearConnectedUsers();

router.ws("/", (connection, req) => {
    console.log("Gateway successfully opened a WebSocket connection");

    connection.on('close', () => console.log('Gateway disconnected!'));

    connection.on("message", async message => {
        console.log("received message from gateway: \n" + message);
        message = JSON.parse(message);
        const user = message.user;
        
        switch(message.event) {
            case "open":
                console.log("received an open event for user: " + user.username);
                try {
                    await join_lobby(connection, message.params.lobby_id, user);
                } catch (e) {
                    console.error("ws | open event | unexpected error occured:\n" + e.message || e.stack || e);
                    return connection.send(JSON.stringify({
                        action: "close",
                        user
                    }));
                }
                break;
            case "close":
                console.log("received a close event for user: " + user.username);
                try {
                    await leave_lobby(connection, message.params.lobby_id, user);
                } catch (e) {
                    console.error("ws | close event | unexpected error occured:\n" + e.message || e.stack || e);
                    return connection.send(JSON.stringify({
                        action: "close",
                        user
                    }));
                }
                break;
            case "message":
                console.log("received a message event for user: " + user.username)
                connection.send(JSON.stringify({
                    "user": message.user,
                    "data": "answer to " + message.data
                }));
            default: 
                console.error("ws | unknown event: " + message.event + ". Event ignored");
        }
    });
});

async function join_lobby(connection, lobby_id, user) {
    try {
        //attempt to save the info about newly connected user to db
        await lobbyService.join(lobby_id, user.username);
    } catch (e) {
        switch (e.type) {
            case "does_not_exist":
                return connection.send(JSON.stringify({
                    action: "close",
                    user,
                    status: 4000,
                    reason: "Lobby with id " + lobby_id + " does not exist"
                }));
            case "lobby_full":
                return connection.send(JSON.stringify({
                    action: "close",
                    user,
                    status: 4001,
                    reason: "Lobby " + lobby_id + " is already full"
                }));
            default:
                throw e;
        }
    }

    //getting all currently connected users to the lobby
    //except the newly connected user
    let users = await lobbyService.getConnectedUsers(lobby_id); //this returns an array of usernames
    users = _.filter(users, u => u !== user.username);

    //broadcast the new user connection event to every other user in lobby
    users.forEach(u => {
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: u
            },
            data: JSON.stringify({
                event: "user_connected",
                user
            })
        }));
    });
    return;
}

async function leave_lobby(connection, lobby_id, user) {
    //attempt to save the info about disconnected user to db
    await lobbyService.leave(lobby_id, user.username);

    //getting all currently connected users to the lobby
    let users = await lobbyService.getConnectedUsers(lobby_id);

    //broadcast the user disconnected event to every remaining user in lobby
    users.forEach(u => {
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: u
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
