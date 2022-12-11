const ws_client = require('ws');
let Clients;
const debug_log = process.env.DEBUG_LOG === "true";

const backends = {
    lobby: {
        host: "lobby",
        port: 3000,
        path: "/ws"
    }, 
    game: {
        host: "game",
        port: 3001,
        path: "/ws" //change endpoint name to the appropriate one
    }
}
let backend_connections = {};

function getConnection(service_name) {
    if (!backend_connections[service_name]) 
        throw new Error("No such connection exists");   
    return backend_connections[service_name];
}

const connectToBackend = (name, retries = 3) => {
    let connection;
    try {
        connection = new ws_client(
            `ws://${backends[name].host}:${backends[name].port}${backends[name].path}`
        );
        if (!connection)
            throw new Error();
    } catch (err) {
        console.error(`Could not establish websocket connection with ${name}:\n` + err.message || err.stack || err);
        if (retries > 0) {
            console.log(`Attempting to reconnect to ${name} in 5 seconds...`);
            return setTimeout(connectToBackend, 5000, name, retries - 1);
        }
        return console.log(`Establishing websocket connection with ${name} was unsuccessful. Abandoning retries...`);
    }
    console.log(`WebSocket connection with ${name} was successfully established`);

    // save the connection for later use
    backend_connections[name] = connection;

    handleBackendConnection(name, connection);
}

function init(ws_clients) {
    connectToBackend("lobby");
    //connectToBackend("game");
    Clients = ws_clients;
}

function handleBackendConnection(service_name, connection) {
    connection.on("message", message => {
        message = JSON.parse(message);
        //todo: add backend message format validation
        debug_log && console.log("Received message from backend: " + JSON.stringify(message, null, "  "));
        const user = message.user;

        let client_connection;
        try {
            client_connection = Clients.getConnection(service_name, user);
        } catch (err) {
            console.error(`Could not get client connection for ${service_name} and ${user.username}. 
                This message from backend will be ignored:\n` + JSON.stringify(message, null, "  "));
            return;
        }

        switch(message.action) {
            case "send":
                let data = typeof message.data === "string" ? 
                    message.data :
                    JSON.stringify(message.data);
                debug_log && console.log(`Sending the message back to the client ${user.username}:\n${data}`);
                return client_connection.send(data);
            case "close":
                debug_log && console.log(`Closing connection for the user ${user.username} by request of ${service_name}...`);
                let status = message.status || 1011;
                let reason = status === 1011 ? "Something went wrong on the backend" : (message.reason || "Initiated by backend");
                try {
                    Clients.closeConnection(service_name, user, status, reason);
                } catch (err) {};
        }
    });

    connection.on("close", () => {
        console.log(`The backend ${service_name} closed websocket connection unexpectedly.
            Attempting to reconnect...`);
        delete backend_connections[service_name];
        connectToBackend(service_name);
    })
}

module.exports = { getConnection, init };
