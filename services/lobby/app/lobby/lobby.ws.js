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
                console.log("received an open event for id: " + message.uuid)
                break;
            case "close":
                console.log("received a close event for id: " + message.uuid)
                break;
            case "message":
                console.log("received a message event for id: " + message.uuid)
                connection.send(JSON.stringify({
                    "uuid": message.uuid,
                    "data": "answer to " + message.data
                }));
        }
    });
});
