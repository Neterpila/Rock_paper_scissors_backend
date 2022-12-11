const express = require('express');
const router = express.Router();
let Backend;
const debug_log = process.env.DEBUG_LOG === "true";

let client_connections = {};

function init(ws_backend) { Backend = ws_backend; }

function getConnection(service_name, user) {
    let connection = client_connections[service_name][user.username];
    if (!connection) 
        throw new Error("No such connection exists");   
    return connection;
}

function closeConnection(service_name, user, status, reason) {
    let connection = getConnection(service_name, user);  
    delete client_connections[service_name][user.username];
    connection.close(status, reason);
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
    let old_connection = client_connections[service_name][user.username];

    // if another client uses the same token to connect to the same endpoint - close the old connection
    if (old_connection) {
        debug_log && console.log("Another client authorized as " + user.username + " connected to " + service_name +
            ". Terminationg the previous connection...");
        old_connection.close(
            1008, 
            "Only one connection per endpoint per token bearer is allowed"
        );
    }

    const saveConnectionAndNotify = () => {
        debug_log && console.log("Client connection opened for " + user.username + " to " + service_name + 
        ". Propagating open event to backend...");
        backend_connection.send(JSON.stringify({
            event: "open",
            user,
            params
        }));

        // saving the connection with the client for future use
        client_connections[service_name][user.username] = connection;
    }

    // Ensuring that if the client opened a new connection while having an existing one,
    // the backend will first receive the close event, and only after that an open event.
    // Also ensure that the connection will be saved.
    // Disclaimer: this is a very ugly way of doing that. Ideally would be to somehow 'await' until the processing
    // of the 'on close' for the old connection finishes before trying to perform 'on open' for the new connection.
    // However this will do for now...
    setTimeout(saveConnectionAndNotify, old_connection ? 100 : 0);

    connection.on("close", () => {
        // The close event is triggered if connection close was initiated both by client and the server.
        // If close was initiated by client, we want to do stuff described below - i.e. notify backend about it.
        // If close was initiated by the server (i.e. the gateway) by request of the backend 
        // the connection in coneections obj will aready be missing.
        if (!client_connections[service_name][user.username])
            return;

        debug_log && console.log("Client connection for " + user.username + " was closed" +
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
