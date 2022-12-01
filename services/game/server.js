var express = require('express');
var socket = require('socket.io');



var app = express();
var server = app.listen(3001,function() {
    console.log('GameServer listening for requests on port 3001');
});
 //Can use path module but bruh
app.use(express.static('app'));



var io = socket(server);
io.on('connection',(socket) => {

    console.log('Made socket connection',socket.id);

    socket.on('communicat',(decision) => {
        io.sockets.emit('communicat',decision);
    });


});

