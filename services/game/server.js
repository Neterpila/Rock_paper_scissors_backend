const { Server } = require('ws');
 
const port = process.env.PORT || 3001;

const sockets_server = new Server({ port: port });

sockets_server.on('connection', (ws, req) => {
    console.log('New client connected!'); 
    //console.log(req);
    //console.log(sockets_server.clients);

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        console.log(message);
    });

   ws.on('close', () => console.log('Client has disconnected!'));
});
