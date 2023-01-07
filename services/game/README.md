#Game Service
## General Information
This Service is responsible for all the functionality reated to games. Creating games, joining, leaving, making moves, saving game history.
All of the functionality may be accessed via either http request or within a websocket connection.

##HTTP
Functions available over http include:
- create a game - we need to send how many rounds we want to play

```json  

  {
    "roundLimit" : "10"
  }
  
```  
- getting existing games

### Joining a game

To join a game you need to open a websocket connection to:<br>
*ws://\<domain\>:\<port\>/game/{game_id}*
- port here is the port of the [WS Gateway](../gateway_ws/).

Example:<br>
ws://localhost:8080/game/63b9e103704df3c30abb1b9d

#### Authorization
Joining a game requires autorization token. Authorization works the same way as with the http endpoints. I.e. you need to pass your jwt token as a Authorization header when joining. If you fail to do so, the handshake will fail with 401 code.

#### Important notes 
Only one connection per bearer is allowed at the same time.<br>
Meaning:
- you may not use the same token to join several games at once
- you may not use the same token to establish several ws connections to the same game

Trying to do so will result in closing the previous connection with 1008 code.

#### Connection closing
The backend may close the ws connection opened by the client. The possible cases are:
- game with provided id does not exist - backend will close the connection with status 4000 
- requested game is already full - backend will close the connection with status 4001
- requested game was already played - backed will close connection

These 3 close cases happen immediately after the client opens the connection

### Leaving a game
Simply close the connection that was previously opened.

### Make Move
In order to send a message to game and make a move you need to join a game first.<br>
Then to the opened connection send the following message as a JSON string:

```json
{
    "choice" : "paper"
}

```

If there are other users in the same game as you are, and they arleady made a move they will get a  message like :
```json
{
    "event": "roundEnded",
    "state": "draw",
    "opponentChoice": "paper",
    "score": "0 : 0",
    "currentRound": 1
}
```
- event field contains the type of event that occured - 'roundEnded' in this case
- state field contains result of the game
- oponnentChoice
- score, on left is always score of client reciving message
- currentRound

If you arleady made a move You will get a message like : 
```json
{
    "event": "Move_made",
    "playerChoice": "paper"
}
```

If you made a invalid move You will get a message like : 

```json
{
    "event": "UnvalidChoice",
    "playerChoice": ""
}
```


### EndOfGameChecking
After end of round gameService will check if we played all the rounds
If it's true we get communicat : 

```json
{
    "event": "GameEnded",
    "gameState": "lost"
}
```

