const express = require('express');
const expressWs = require('express-ws')(express);
const router = express.Router();
const lobbyService = require('./lobby.service');
const _ = require('lodash');
const axios = require("axios");
const debug_log = process.env.DEBUG_LOG === "true";

// purge all connected users from db when the server starts
// because data about connected users is not removed from db when the server stops
lobbyService.clearConnectedUsers();

router.ws("/", (connection, req) => {
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
                    return await join_lobby(connection, message.params.lobby_id, user);
                case "close":
                    return await leave_lobby(connection, message.params.lobby_id, user);
                case "message":
                    return await handleMessageEvent(connection, message, user);
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

async function handleMessageEvent(connection, message, user) {
    let original_message;
    try {
        original_message = JSON.parse(message.data);
    } catch (err) {
        debug_log && console.log("Client's original message is not a JSON. Ignoring...");
        return;
    }

    switch(original_message.action) {
        case "chat":
            return await sendChatMessage(connection, message.params.lobby_id, user, original_message.data);
        case "ready": 
            return await setReady(connection, message.params.lobby_id, user, true);
        case "unready": 
            return await setReady(connection, message.params.lobby_id, user, false);
        default:
            debug_log && console.error("ws | unknown action from client: " + original_message.action + ". Ignoring...");
    }
}

async function setReady(connection, lobby_id, user, status) {
    let status_changed = await lobbyService.setReady(lobby_id, user.username, status);

    // if status hasn't changed - nothing to do here
    if (!status_changed)
        return;

    // if status has changed notify everyone else in the lobby
    let connected_users = await lobbyService.getConnectedUsers(lobby_id);
    let users_to_notify = _.filter(connected_users, u => u.username !== user.username);
    users_to_notify.forEach(u => {
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: u.username
            },
            data: JSON.stringify({
                event: status ? "user_ready" : "user_unready",
                from: user
            })
        }));
    });

    if (!status)
        return;

    //if status changed to ready, check if everyone is ready and start the game
    if (status) {
        if (connected_users.length >= 2 &&
            connected_users.every(u => u.is_ready)) {
            // send an http request to Game Service here
            let game_id;
            try {
                response = await axios.post(`http://${process.env.GAME_SERVICE_HOSTNAME}:8080`);
                if (!response.data || !response.data._id) {
                    throw new Error("No _id field is present in the response from the Game service");
                }
                game_id = response.data._id;
            } catch (err) {
                throw new Error("Could not create a new game", err);
            }

            connected_users.forEach(u => {
                connection.send(JSON.stringify({
                    action: "send",
                    user: {
                        username: u.username
                    },
                    data: JSON.stringify({
                        event: "game_started",
                        game_id
                    })
                }));

                //also unready the user
                lobbyService.setReady(lobby_id, u.username, false);
            });
        }
    }
}

async function sendChatMessage(connection, lobby_id, user, data) {
    let connected_users = await lobbyService.getConnectedUsers(lobby_id);
    connected_users = _.filter(connected_users, u => u.username !== user.username);

    //broadcast the chat message to every other user in lobby
    connected_users.forEach(u => {
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: u.username
            },
            data: JSON.stringify({
                event: "chat",
                from: user,
                data: typeof data === "string" ? data : JSON.stringify(data)
            })
        }));
    });
    return;
}

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
    users = _.filter(users, u => u.username !== user.username);

    //broadcast the new user connection event to every other user in lobby
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
