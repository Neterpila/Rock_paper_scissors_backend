

game.js is our client
server.js is our server

Player A is sending info about decision (rock , paper , scissors).
If our oponnent(player B) hasn't made his turn, we save decision of Player A and wait.
When player B made his turn we update status of the game, check who won and send that info to both Players. 
Then next round is started

<<TODO>>

After both players join game we open on their side game client and send roomNumber as entry data. Both players are then in proper
rooms and game is started.

https://www.geeksforgeeks.org/how-to-open-url-in-a-new-window-using-javascript/