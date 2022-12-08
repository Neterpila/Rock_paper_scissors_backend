const ws_client = require('ws');
const ws_server = require('ws').Server;
const short = require('short-uuid');

let client_connections = {};
 
const sockserver = new ws_server({ port: 3011 });
const backend_connection = new ws_client("ws://lobby:3010/");

backend_connection.on("connection", () => {
    console.log("WebSocket to backend successfully established");
});

backend_connection.on("message", (message) => {
    message = JSON.parse(message);
    let id = message.uuid;
    console.log("received message from backend for id " + id + " with data:\n" + message.data);
    console.log("sending the message back to the client " + id);
    client_connections[id].send(message.data);
});

sockserver.on("connection", (client_connection, req) => {
    if (req.headers.authorization !== "Bearer qwe123") {
        client_connection.send("Token invalid");
        client_connection.close();
    }

    const id = short.generate();
    client_connections[id] = client_connection;
    console.log("client connection opened: " + id);

    console.log("sending open event to backend: " + id);
    backend_connection.send(JSON.stringify({
        "event": "open",
        "uuid": id
    }));

    client_connection.on("close", () => {
        console.log("client connection closed: " + id);
        console.log("sending close event to backend: " + id);
        backend_connection.send(JSON.stringify({
            "event": "close",
            "uuid": id
        }));
    });

    client_connection.on("message", message => {
        console.log("received message from client:\n" + message);
        console.log("redirecting message from client " + id + " to backend ");
        backend_connection.send(JSON.stringify({
            "event": "message",
            "uuid": id,
            "data": message.toString('utf8')
        }));
    })
});
