const express = require('express');
const router = express.Router();
let Backend;
const debug_log = process.env.DEBUG_LOG === "true";

let client_connections = {};

function init(ws_backend) { Backend = ws_backend; }

function getConnection(service_name, user) {
    if (!client_connections[service_name][user.username]) 
        throw new Error("No such connection exists");   
    return client_connections[service_name][user.username];
}

function closeConnection(service_name, user, status, reason) {
    if (!client_connections[service_name][user.username]) 
        throw new Error("No such connection exists");   
    client_connections[service_name][user.username].close(status, reason);
    delete client_connections.lobby[user.username];
}

function handleClientConnection(connection, user, service_name, params) {
    // getting the corresponding ws backend connection
    // e.g. for /lobby endpoint this would be the ws connection with the Lobby Service
    let backend_connection;
    try {
        backend_connection = Backend.getConnection(service_name);
    } catch {
        console.error("Could not get the backend connection for " + service_name);
        connection.close(1011);
        return;
    }

    client_connections[service_name] ||= {};
    // if another client uses the same token to connect to the same endpoint -
    // close the old connection and open the new one
    if (client_connections[service_name][user.username]) {
        debug_log && console.log("Another client authorized as " + user.username + " connected to " + service_name +
            ". Terminationg the previous connection...");
        client_connections[service_name][user.username].close(
            1008, 
            "Only one connection per endpoint per token bearer is allowed"
        );
    }
    // saving the connection with the client for future use
    client_connections[service_name][user.username] = connection;
    debug_log && console.log("Client connection opened for " + user.username + " to " + service_name + 
        ". Propagating open event to backend...");
    backend_connection.send(JSON.stringify({
        event: "open",
        user,
        params
    }));

    connection.on("close", () => {
        // the close event is triggered if connection close was initiated both by client and the server.
        // if close was initiated by client, we want to do stuff described below.
        // if close was initiated by the server (i.e. the gateway) by request of the backend, stuff below is unnecessary
        if (!client_connections[service_name][user.username])
            return;

        debug_log && console.log("Client connection closed for " + user.username + " was closed" +
            ". Propagating close event to backend...");
        backend_connection.send(JSON.stringify({
            event: "close",
            user,
            params
        }));
        delete client_connections[service_name][user.username];
    });

    connection.on("message", message => {
        debug_log && console.log("Received message from client " + user.username + " for " 
            + service_name + ":\n" + message + "\nRedirecting message to backend...");
        backend_connection.send(JSON.stringify({
            event: "message",
            user,
            params,
            data: message.toString('utf8')
        }));
    })
}

router.ws('/lobby/:lobby_id', (connection, req) => {
    handleClientConnection(connection, req.user, "lobby", {
        lobby_id: req.params.lobby_id
    });
});

router.ws('/game/:game_id', (connection, req) => {
    handleClientConnection(connection, req.user, "game", {
        game_id: req.params.game_id
    });
});

module.exports = { router, init, getConnection, closeConnection };
