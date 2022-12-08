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
    let user = message.user;
    console.log("received message from backend for user " + user.username + " with data: " + message.data);
    console.log("sending the message back to the client " + user.username);
    client_connections.lobby[user.username].send(message.data);
});

const handle_client_connection = (client_connection, req, backend_service, params) => {
    const user = req.user;

    client_connections[backend_service][user.username] = client_connection;
    console.log("client connection opened: " + user.username);

    console.log("sending open event to backend: " + user.username);
    backend_connections[backend_service].send(JSON.stringify({
        event: "open",
        user,
        params
    }));

    client_connection.on("close", () => {
        console.log("client connection closed: " + user.username);
        console.log("sending close event to backend: " + user.username);
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
