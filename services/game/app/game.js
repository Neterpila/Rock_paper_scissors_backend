var socket = io.connect('http://localhost:3001');


let clientRoom;
let clientNumberLocal;
let playerNo;
let yourTurn;

socket.on('serverMsg', (roomNumber,clientNumber,no) => {
    console.log('I im in room ' + roomNumber + ' As client nr : ' + clientNumber + ' As player nr ' + no);
    clientRoom = roomNumber;
    clientNumberLocal = clientNumber;
    playerNo = no;
})

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

    decision = 'rock';
    socket.emit('makeMove',decision,clientRoom,clientNumberLocal);
    yourTurn=false;
});

//Paper button emitter
paperBtn.addEventListener('click',(decision) => {

    decision = 'paper';
    socket.emit('makeMove',decision,clientRoom,clientNumberLocal);
    yourTurn=false;
});

//Scissors button emitter
scissorsBtn.addEventListener('click',(decision) =>{

    decision = 'scissors';
    socket.emit('makeMove',decision,clientRoom,clientNumberLocal);
    yourTurn=false;
});

socket.on('stateUpdate',data => {
    console.table(data)
    roundScore.innerHTML = `<h2>YOU: ${data.youScore} OPPONENT: ${data.opponentScore}</h2>`
    communicat.innerHTML += `<p><em> You choose  ${data.you} ! </em></p>`;
    communicat.innerHTML += `<p><em> He choose  ${data.opponent} ! </em></p>`;
    communicat.innerHTML += `<p><em> ${data.message} </em></p>`;
    communicat.innerHTML += `<p><em> ------------------------------</em></p>`;

    
});

