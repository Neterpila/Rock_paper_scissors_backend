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
*not implemented yet*
