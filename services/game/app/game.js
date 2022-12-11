var socket = io.connect('http://localhost:3001');


let clientRoom;
let clientNumberLocal;
let playerNo;

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
    socket.emit('communicat',decision,clientRoom,clientNumber);
});

//Paper button emitter
paperBtn.addEventListener('click',(decision) => {

    decision = 'paper';
    socket.emit('communicat',decision,clientRoom,clientNumber);
    
});

//Scissors button emitter
scissorsBtn.addEventListener('click',(decision) =>{

    decision = 'scissors';
    socket.emit('communicat',decision,clientRoom,clientNumber);

});


//Listen for events, based on results cheange html content
socket.on('communicat',(decision,no) => {
    console.log(" Player no : " + no);
    if(playerNo=no) {
        myDecision = decision;
    }   else enemyDecision=decision;

    switch(decision) {
        case 'rock':
            communicat.innerHTML += `<p><em> Player  ${playerNo}  use Rock! </em></p>`;
            break;
        case 'paper':
            communicat.innerHTML += `<p><em> Player  ${playerNo}  use Paper! </em></p>`;
            break;
        case 'scissors':
            communicat.innerHTML += `<p><em> Player  ${playerNo}  use Scissors! </em></p>`;
            break;
    }


})




//nozyce


//wyjdz z gry

//restart 
