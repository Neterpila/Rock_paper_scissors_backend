var express = require('express');
var socket = require('socket.io');

var app = express();
var server = app.listen(3001,function() {
    console.log('GameServer listening for requests on port 3001');
});
 
app.use(express.static('app'));

// const port = process.env.PORT || 3001;
// const sockets_server = new Server({ port: port });

var io = socket(server);
io.on('connection',(socket) => {

    console.log('Made socket connection',socket.id);

    socket.on('communicat',function(data) {
        io.sockets.emit('communicat',data);
    });

    

});

// sockets_server.on('connection', (ws, req) => {
//     console.log('New client connected!'); 
//     //console.log(req);
//     //console.log(sockets_server.clients);

//     ws.on('message', (data) => {
//         const message = JSON.parse(data);
//         console.log(message);

//     });


//    ws.on('close', () => console.log('Client has disconnected!'));
// });
