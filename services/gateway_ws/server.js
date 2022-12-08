const express = require('express');
const app = express();
const jwt_validator = require("./app/jwt_validate");

const expressWs = require('express-ws')(app, null, {
    wsOptions: { 
        verifyClient: ({ req }, done) => {
            jwt_validator(req.headers.authorization).then(payload => {
                req.user = payload;
                return done(true);
            }).catch(e => {
                return done(false, 401);
            })
        }
    }
});

const ws_client = require('ws');

let client_connections = {
    lobby: {},
    game: {}
};
 
let backend_connections = {};
try {
    backend_connections.lobby = new ws_client("ws://lobby:3000/ws");
    console.log("WebSocket to Lobby Service successfully established");
} catch (err) {
    console.log("WebSocket to Lobby Service failed:\n" + err.message || err.stack || err);
}
//todo: add another connection to game service here later

backend_connections.lobby.on("message", (message) => {
    message = JSON.parse(message);
    console.log("received message from backend: " + JSON.stringify(message));
    //todo: add backend message format validation
    let user = message.user;

    switch(message.action) {
        case "send":
            let data = typeof message.data === "string" ? 
                message.data :
                JSON.stringify(message.data);
            console.log("sending the message back to the user " + user.username);
            return client_connections.lobby[user.username].send(data);
        case "close":
            console.log("closing connection for the user " + user.username + " by request of the backend");
            let status = message.status || 1011;
            let reason = status === 1011 ? "Something went wrong on the backend" : (message.reason || "Initiated by backend");
            client_connections.lobby[user.username].close(status, reason);
            delete client_connections.lobby[user.username];
    }
});

const handle_client_connection = (client_connection, req, backend_service, params) => {
    const user = req.user;

    client_connections[backend_service][user.username] = client_connection;
    console.log("client connection opened: " + user.username);

    console.log("propagating open event to backend: " + user.username);
    backend_connections[backend_service].send(JSON.stringify({
        event: "open",
        user,
        params
    }));

    client_connection.on("close", () => {
        // the close event is triggered if connection close was initiated both by client and the server.
        // if close was initiated by client, we want to do stuff described below.
        // if close was initiated by the server (i.e. the gateway) by request of the backend, stuff below is unnecessary
        if (!client_connections[backend_service][user.username])
            return;

        console.log("client connection closed: " + user.username);
        console.log("propagating close event to backend: " + user.username);
        backend_connections[backend_service].send(JSON.stringify({
            event: "close",
            user,
            params
        }));
        delete client_connections[backend_service][user.username];
    });

    client_connection.on("message", message => {
        console.log("received message from client:" + message);
        console.log("redirecting message from client " + user.username + " to backend ");
        backend_connections[backend_service].send(JSON.stringify({
            event: "message",
            user,
            params,
            data: message.toString('utf8')
        }));
    })
}

app.ws('/lobby/:lobby_id', (client_connection, req) => {
    handle_client_connection(client_connection, req, "lobby", {
        lobby_id: req.params.lobby_id
    });
});

//todo: add another route for game service here

app.get('/health', function(req, res, next){
    res.status(200).send();
});

const port = process.env.PORT || 3011;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});
