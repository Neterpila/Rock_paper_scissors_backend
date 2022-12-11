const express = require('express');
const expressWs = require('express-ws')(express);
const router = express.Router();
const lobbyService = require('./lobby.service');
const _ = require('lodash');
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
                    return handleMessageEvent(connection, message, user);
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
        //todo: support some more user interactions within a lobby - e.g. set ready status
        default:
            debug_log && console.error("ws | unknown action from client: " + original_message.action + ". Ignoring...");
    }
}

async function sendChatMessage(connection, lobby_id, user, data) {
    let connected_users = await lobbyService.getConnectedUsers(lobby_id);
    connected_users = _.filter(connected_users, u => u !== user.username);

    //broadcast the chat message to every other user in lobby
    connected_users.forEach(u => {
        connection.send(JSON.stringify({
            action: "send",
            user: {
                username: u
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
