

var socket = io.connect('http://localhost:3001');

var communicat = document.getElementById('communicat')
var decision = "",
        rockBtn = document.getElementById('rock'),
        paperBtn = document.getElementById('paper'),
        scissorsBtn = document.getElementById('scissors');
        

//rock button emitter
rockBtn.addEventListener('click',function() {

    //communicat.innerHTML += '<p><em> it is a rock </em></p>';
    console.log('im alive socket emiter');

    socket.emit('communicat', {
        communicat: communicat.value
    });
    decision = 'rock';
    
});

paperBtn.addEventListener('click',function() {

    //communicat.innerHTML += '<p><em> it is a rock </em></p>';
    console.log('im alive socket emiter');

    socket.emit('communicat', {
        communicat: communicat.value
    });
    decision = 'paper';
    
});

scissorsBtn.addEventListener('click',function() {

    //communicat.innerHTML += '<p><em> it is a rock </em></p>';
    console.log('im alive socket emiter');

    socket.emit('communicat', {
        communicat: communicat.value
    });
    decision = 'scissors';
    console.log(decision);
});

socket.on('communicat',function(data){
    console.log(decision);
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
