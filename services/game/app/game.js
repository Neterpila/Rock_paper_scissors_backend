var socket = io.connect('http://localhost:3001');


let clientRoom;
let yourTurn;
let clientNumberLocal;
let myMove;
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

    yourTurn = false;
    decision = 'rock';
    socket.emit('communicat',decision,clientRoom);
});

//Paper button emitter
paperBtn.addEventListener('click',(decision) => {

    yourTurn = false;
    decision = 'paper';
    socket.emit('communicat',decision,clientRoom);
    
});

//Scissors button emitter
scissorsBtn.addEventListener('click',(decision) =>{

    yourTurn = false;
    decision = 'scissors';
    socket.emit('communicat',decision,clientRoom);

});


//Listen for events, based on results cheange html content
socket.on('communicat',(decision,no) => {
    console.log(" Player no : " + no);
    if(playerNo == no) {
        myDecision = decision;
            //Just post my own decision
            switch(myDecision) {
                case 'rock':
                    communicat.innerHTML += `<p><em> I as player  ${playerNo}   use Rock! </em></p>`;
                    break;
                case 'paper':
                    communicat.innerHTML += `<p><em> I as player  ${playerNo}   use Paper! </em></p>`;
                    break;
                case 'scissors':
                    communicat.innerHTML += `<p><em> I as player  ${playerNo}   use Scissors! </em></p>`;
                    break;
            }
    }

})

socket.on('enemyDecision',(decision) => {

    enemyDecision = decision;

    switch(enemyDecision) {
        case 'rock':
            communicat.innerHTML += `<p><em> I as player  ${clientNumberLocal}    use Rock! </em></p>`;
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
