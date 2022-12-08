const { Server } = require('ws');

let ws_clients = {};
 
const sockserver = new Server({ port: 3010 });
sockserver.on('connection', (connection, req) => {
    console.log("Gateway successfully opened a WebSocket connection");

    connection.on('close', () => console.log('Gateway disconnected!'));

    connection.on("message", message => {
        message = JSON.parse(message);
        console.log("received message from gateway: \n" + JSON.stringify(message));

        switch(message.event) {
            case "open":
                console.log("received an open event for user: " + message.user.username)
                break;
            case "close":
                console.log("received a close event for user: " + message.user.username)
                break;
            case "message":
                console.log("received a message event for user: " + message.user.username)
                connection.send(JSON.stringify({
                    "user": message.user,
                    "data": "answer to " + message.data
                }));
        }
    });
});
