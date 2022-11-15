

var socket = io.connect('http://localhost:3001');
var yourTurn = true;

const moves = {
    "rock" : "scissors",
    "paper": "rock",
    "scissors": "paper"
}


var communicat = document.getElementById('communicat')
var roundScore = document.getElementById('roundScore')
var gameScore = document.getElementById('gameScore')
var decision = ""
const rockBtn = document.getElementById('rock'),
        paperBtn = document.getElementById('paper'),
        scissorsBtn = document.getElementById('scissors')
        

//Rock button emitter
rockBtn.addEventListener('click',(decision) => {

    yourTurn = false;
    decision = 'rock';
    socket.emit('communicat', decision);

});

//Paper button emitter
paperBtn.addEventListener('click',(decision) => {

    yourTurn = false;
    decision = 'paper';
    socket.emit('communicat', decision);
    
    
});

//Scissors button emitter
scissorsBtn.addEventListener('click',(decision) =>{

    yourTurn = false;
    decision = 'scissors';
    socket.emit('communicat', decision);
    

});


//Listen for events, based on results cheange html content
socket.on('communicat',(arg) => {

    decision = arg;

    switch(decision) {
        case 'rock':
            communicat.innerHTML += '<p><em> it is a rock </em></p>';
            break;
        case 'paper':
            communicat.innerHTML += '<p><em> it is a paper </em></p>';
            break;
        case 'scissors':
            communicat.innerHTML += '<p><em> it is a scissors </em></p>';
            break;
    }

   
})



//nozyce


//wyjdz z gry

//restart 
