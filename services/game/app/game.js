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


//Listen for events, based on results cheange html content
//socket.on('communicat',(decision,no) => {
//    console.log(" Player no : " + no);
//    if(playerNo==no) {
//        switch(decision) {
//            case 'rock':
//                communicat.innerHTML += `<p><em> Player  ${playerNo}  use Rock! </em></p>`;
//                yourTurn=true;
//                break;
//            case 'paper':
//                communicat.innerHTML += `<p><em> Player  ${playerNo}  use Paper! </em></p>`;
//                yourTurn=true;
//                break;
//            case 'scissors':
//                communicat.innerHTML += `<p><em> Player  ${playerNo}  use Scissors! </em></p>`;
//                yourTurn=true;
//                break;
//        }
//    }else if (yourTurn==false) {
//
//
//    }
//
//
//})

socket.on('stateUpdate',data => {
    console.table(data)

});





//nozyce


//wyjdz z gry

//restart 
