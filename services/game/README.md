# Game Service
## General Information
This Service is responsible for all the functionality reated to games. Creating games, joining, leaving, making moves, saving game history.
All of the functionality may be accessed via either http request or within a websocket connection.

## HTTP
Functions available over http include:
- creating a game (only for internal use in the backend, won't be available in the API)
optional round_limit can be sent in the the request body:
```json  
  {
    "round_limit" : 10
  }
```
otherwise the game is created with the default 10 rounds
- getting existing games (only for internal use in the backend, won't be available in the API)

## WebSocket

### Joining a game

To join a game you need to open a websocket connection to:<br>
*ws://\<domain\>:\<port\>/game/{game_id}*
- port here is the port of the [WS Gateway](../gateway_ws/)
- game_id is the id received from the lobby after [ready checking](../lobby/#ready-checking)

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
- requested game was already played - backed will close connection with status 4002

These 3 close cases happen immediately after the client opens the connection

### Leaving a game
Simply close the connection that was previously opened.

### Make a move [^](https://music.youtube.com/watch?v=ZEeSky-GGNQ&feature=share)
In order to send a message to a game and make a move you need to join a game first.<br>
Then to the opened connection send the following message as a JSON string:
```json
{
    "action": "move",
    "data": {
        "move": "rock"
    }
}
```
Available moves:
- rock
- paper
- scissors

(duh)

If the oponent has not yet joined, you'll get:
```json
{
    "event": "opponent_missing",
    "message": "Opponent has not yet joined the game, please wait"
}
```

If the opponent had not yet made their move in the current round you'll get:
```json
{
    "event": "move_made",
    "data": {
        "move": "rock"
    }
}
```

If the opponent had already made their move you'll get:
```json
{
    "event": "round_ended",
    "data": {
        "state": "win",
        "opponent_move": "paper",
        "score": "0 : 1",
        "current_round": 1
    }
}
```
- event field contains the type of event that occured - 'round_ended' in this case
- state - the result of the round (can eiter be "win", "lose" or "draw")
- opponent_move - the move selected by the opponent
- score - on left is the score of the client receiving message
- current_round - the number of round the results above relate to (i.e. it the round that just ended)

You cannot alter your move in the current round if you arleady made it. Trying to do so will result in a message like: 
```json
{
    "event": "move_already_made",
    "data": {
        "move": "rock" //this is the move you previously made in the current round that is "memorized" by the backend
    }
}
```

If you made an invalid move you will get a message like: 
```json
{
    "event": "invalid_choice",
    "data": {
        "move": "" //either an empty string if no move was yet made in the current round, or a move "memorized" by the backend (if previously made)
    }
}
```

### End of game
If the round just ended was the last one, then you will also get a message with the game summary.
```json
{
    "event": "game_ended",
    "data": {
        "state": "win",
        "score": "7 : 3"
    }
}
```
- state - the result of the game (can eiter be "win", "lose" or "draw")
- score - on left is the score of the client receiving message
