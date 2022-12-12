# WS API Gateway
## Disclamer
The original plan was to have a centralized entrypoint to the backend. And as the gateway solution [KrakenD](https://www.krakend.io/docs/overview/) was used. <br>
Also look [here](../gateway)

However, after the KrakenD was already in use and configured for a host of existing http endpoints, came the time to implement some websocket endpoints. ~~It is at this moment that we knew - we fucked up~~ At this point we realized, that KrakenD has websocket support only in enterprise edition, which we did not intent to get. That's why (at least for now) we ended up with 2 separate gateways: one already configured for http, and this one, custom wrote in JS, for ws connections.

## Key concepts and core assumptions
### Connection with backend
Websocket connections are rather pricy in terms of resources. That's why instead of creating a new connection with the backend service for each new client, the gateway creates only one connection with each service during startup. Within this single connection the gateway talks to the specific backend service in a certain language to let the backend know what happened and to which client, and also expects to receive specific messages from the backend with instructions on what to do with which cliend. More on that later.

### Limitations
Any given client will only need (and be able) to use a single instance of backend functionality at a time. For instance: a client won't be able to join several lobbies simultaneously or participate in several games simultaneously.

Only one token bearer may simultaniously be connected to any given part of functionality. For instance: a user (being authorized as such) will not be able to play the same game from 2 (or more) different devices.<br>
This limitation is somewhat arbitrary, but allows to simplify the implementation.

Therefore the gateway can identify every client connection by:
- username from the jwt passed by the client
- part of functionality the cllient wants to use - in our case it is either something related to lobby (joining, chatting, etc.) or something related to actual game (making moves etc.) - which is very convenient, as these are provided by 2 backend services.

## Implementation
After considering everything explained in the previous chapter the following concept emerges:<br><br>
![WS Gateway architecture](../../misc/ws_gateway.jpeg)
<br><br>
Takeaways:
- gateway keeps one WS connection at all times to any backend service
- gateway provides one WS endpoint for each part of functionality (de facto for each backend service)
- depending on the actions of clients on those endpoints, the gateway propagates messages to the corresponding backend
- messages sent between the gateway and backends have a specified format (language, if you wish)

### The language
#### Key concept
The gateway by itself does not know what to do with each client - this is the responsibility of backends.<br>
The gateway <ins>informs</ins> the backend about what happens to its corresponding ws endpoint. In other words the gateway sends <ins>events</ins> to a backend.<br>
Depending on what happens, a backend <ins>commands</ins> the gateway to do something with a specific client. In other words a backend sends <ins>actions</ins> to the gateway.

#### How it works
All of the messages sent within the connections from gateway to backends are expected to be a JSON string.

All messages that are sent both sides are required to have a 'user' field. It contains the information about the authorized user using a gateway ws endpoint.

Messages sent from the gateway to a backend always have an 'event' field that specifies *what* happened.<br>
There are currently 3 options:
- open - a client opened a ws connection to an endpoint
- message - a client sent a message the opened connection
- close - a client closed the connection they opened earlier

Messages sent from a backend to the gateway are required to have an 'action' field.<br>
There are 2 options:
- send - commands the gateway to send a specified messsage back to the client
- close - commands the gateway to close the client connection with the specified code and reason

### Authorization
Clients are expected to send their jwt token within the Authorization header when they attempt to establish a connection to any ws endpoint. It works the same way as the authorization on the http endpoints.<br>
If a client fails to send a token or sends an invalid one, the handshake fails with 401 code and the connection is not established at all.
