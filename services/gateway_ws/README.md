# WS API Gateway
## Disclamer
The original plan was to have a centralized entrypoint to the backend. And as the gateway solution [KrakenD](https://www.krakend.io/docs/overview/) was used. <br>
Also look [here](../gateway)

However, after the KrakenD was already in use and configured for a host of existing http endpoints, came the time to implement some websocket endpoints. ~~It is at this moment that we knew - we fucked up~~ At this point we realized, that KrakenD has websocket support only in enterprise edition, which we did not intent to get. That's why, at least for now, we ended up with 2 separate gateways: one already configured for http, and this one, custom wrote in JS, for ws connections.

## Key concepts and core assumptions
todo: add desc later

## Implementation
todo: write something here as well
![WS Gateway communication](../../misc/ws_gateway.jpeg)