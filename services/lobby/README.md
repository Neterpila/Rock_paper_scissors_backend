# Lobby Service
## General information
This service is responsible for all the functionality related to lobbies. Creating new lobbies, requesting existing ones, joining, chatting, etc.<br>
All of the functionality may be accessed via either http requests or within a websocket connection.

## HTTP
Functions available over http include:
- creating a lobby
- deleteng a lobby
- getting existing lobbies

For more details on those please visit [Swagger-UI](../swagger/).

## WebSocket
Functions available over websocket include:
- joining a lobby
- leaving a lobby
- chatting (within a lobby)
- setting ready check (within a lobby)

### Joining a lobby
To join a lobby you need to open a websocket connection to:<br>
*ws://\<domain\>:\<port\>/lobby/{lobby_id}*
- port here is the port of the [WS Gateway](../gateway_ws/).

Example:<br>
ws://localhost:8082/lobby/63922321eafc30d85d48aa48

#### Authorization
Joining a lobby requires autorization token. Authorization works the same way as with the http endpoints. I.e. you need to pass your jwt token as a Authorization header when joining. If you fail to do so, the handshake will fail with 401 code.

#### Important notes 
Only one connection per bearer is allowed at the same time.<br>
Meaning:
- you may not use the same token to join several lobbies at once
- you may not use the same token to establish several ws connections to the same lobby

Trying to do so will result in closing the previous connection with 1008 code.

#### Connection closing
The backend may close the ws connection opened by the client. The possible cases are:
- lobby with provided id does not exist - backend will close the connection with status 4000 
- requested lobby is already full - backend will close the connection with status 4001

These 2 close cases happen immediately after the client opens the connection

### Leaving a lobby
Simply close the connection that was previously opened.

### Chatting
In order to send a message to lobby chat you need to join a lobby first.<br>
Then to the opened connection send the following message as a JSON string:
```json
{
    "action": "chat",
    "data": "Hello, I'm Dude"
}
```

If there are other users in the same lobby as you are, they will receive the following message:
```json
{
    "event": "chat",
    "from": {
        "username": "the_dude_lebowski"
    },
    "data": "Hello, I'm Dude"
}
```
- event field contains the type of event that occured - 'chat' in this case
- from field contains the information about a user event originated from (in this case its the sender of the chat message)
- data field contains the message itself

### Ready checking
In order to start a game both users in a lobby must first let the backend (and each other) know that they are ready.<br>
In order to do that you should send the following message to the connection.
```json
{
    "action": "ready"
}
```

Other user in the lobby will recieve a message like this:
```json
{
    "event": "user_ready",
    "from": {
        "username": "the_dude_lebowski"
    }
}
```

If you've changed your mind you can also unready:
```json
{
    "action": "unready"
}
```

And other user will also know about it:
```json
{
    "event": "user_unready",
    "from": {
        "username": "the_dude_lebowski"
    }
}
```

### Starting a game

In case both users in the lobby are ready, the game is started. Both clients will receive the following message:
```json
{
    "event": "game_started",
    "game_id": "09822321eafc30d85d48aa1a"
}
```

The clients should than take this game id and open a new connection to another WebSocket endpoint. You can find more info on how to connect and what to do an that endpoint [here](../game/).

After the game starts the connection to the lobby is not closed and you can still chat in it for example (you'll have to handle that of the frontend though).<br>
After the game ends you may disconnect from the game endpoint and do a new ready check here in the lobby to start another game.
