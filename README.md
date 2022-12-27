# Rock Paper Scissors backend
This repo contains a backend of a university group project for a subject called 'web applications'. The goal is to create an online rock paper scissoes game, where people will be able to play against each other.

Backend consists of several microservices each run in docker using compose. This repo contains all those microservies along with configuration files to run everything.
> Ideally it would be a better practice to have a separate repo for each service, however for the purposes of the project it isn't necessary as we won't need to manage versions, implement sophisticated deployment techniques, etc. 

> One Repo to rule them all, One Repo to find them, One Repo to bring them all and in the docker bind them.


## Architecture and description
*Things you are gonna read down below might be a subject for constant change*

![Project architecture](./misc/architecture.jpeg)

Planned services:
- Game Service - a service that manages the game, saves the players' choices and provides the player with the choice of another player in a given round.
- Lobby Service - a service that allows browsing lobbies, creating own lobbies, connecting, as well as manages other in-lobby activities 
- API Gateway - mainly deals with authorization and routing

Users will use the mobile/web application.

Technologies:
- Node.js - runtime environment for JS (for backend microservices)
- Express, WS - libraries for HTTP/WebSocket servers
- MongoDB - a database for storing users and common information about games
- Mongoose - a library to connect to the database from microservices
- cAdvisor, Node-Exported, Prometheus - tools for collecting container and system metrics
- Loki, Promtail - tools for aggregating and indexing services' logs
- Grafana - a tool for visualizing the collected metrics
- Flutter - a set of tools designed to create native applications for various platforms (frontend app)


## How to run the backend?
1. Install Docker https://www.docker.com/
2. Clone project
3. Launch Docker on your machine
4. In project directory run `docker-compose up --build`.
5. You now have everything set up (at least in theory). Try to make a request to one of the services using apps such as Postman (or a browser of your choice

Compose services also have configured profiles, which means that not all services will be run by default.<br>
`docker compose up` will only run the core backend services without any additional stuff. Those are: MongoDB, Lobby, Game, Auth, Gateway. If you want to also enable monitoring and/or SwaggerUI you'll need to use profiles.

`docker compose --profile monitoring up` apart from core services will also run cAdvisor, Node-Exported, Prometheus, Loki, Promtail and Grafana.<br>
`docker compose --profile swagger up` apart from core services will also run SwaggerUI.<br>
`docker compose --profile monitoring --profile swagger up` will run everything there is.

## How to contribute?
1. Create a branch for a feature you want to add
2. Push the branch to origin
2. Create a pull request and request a review from one of the team members


## API
To view http endpoints available to the frontend please visit Swagger.<br>
Swagger is hosted as a separate service and is available under the 8081 port (unless you specifically changed your docker compose file).<br>

If you run the backend on your local machine, just open your browser of choice and proceed to http://localhost:8081/. Also take note of run options described above.


## Docker config info
All the JS services and SwaggerUI are listening on the 8080 port by default. Mongo listens on it's default 27017 port.<br>
Those are the ports that the services would request each other by inside the docker network.

In order to send a request from the machine hosting the whole stack some port forwarding had to be made:
- API Gateway - 8080
- SwaggerUI - 8081
- Lobby Service - 3000
- Game Service - 3001
- Auth Service - 3002
- Mongo - 27020

**Examples:**<br>
The Lobby Service trying to connect to the MongoDB would use a url like this:<br>
mongodb://db_username:db_password@mongo:27017 - where 'mongo' is the name of a service in compose<br>
If you're running compose on your local machine and would want to connect to mongo directly (e.g. using a client like Compass), you would use:<br>
mongodb://db_username:db_password@localhost:27020

API Gateway trying to send a request to Lobby Service would use a url like this:<br>
GET http://lobby:8080/ - where 'lobby' is the name of a service in compose<br>
If you would want to request Lobby Service directly for debug reasons, you would use:<br>
GET http://localhost:3000/

## Monitoring
As monitoring/alerting tools this project uses:
- cAdvisor - provides container specific metrics
- Node-Exporter - provides host specific metrics
- Prometheus - collects metrics data
- Loki - aggregates logs from other containers, stores and indexes them
- Promtail - scrapes logs and actually stores them in Loki
- Grafana - used to visualize metrics sourced from Prometheus as well as allows querying logs from Loki

> Current compose config as well as other metric-collecting services' configs were created with a unix host in mind. Current configuration works fine on a MacOS with Docker Desktop for Mac and will *probably* work fine on another *nix system with Docker. Some monitoring services/functinality may or may not work on a Windows machine. This requires further testing/adjustments.

Grafana is available on a 8090 port. Currently it only has one admin user whose password can be looked up in envs passed to Grafana service (in compose file). Upon entering you should be able to view a single existing dashboard (Dashboards -> Browse -> General -> Metrics). It should look something like this:<br>
![Grafana dashboard](./misc/grafana_example.jpeg)

As for logs - those can be queried with Grafana in Explore section (be sure to select Loki as datasource) or from Loki itself which is available on 8094 on the host machine.

## Docker config info
All the JS services and SwaggerUI are listening on the 8080 port by default. Mongo listens on it's default 27017 port.<br>
Those are the ports that the services would request each other by inside the docker network.

In order to send a request from the machine hosting the whole stack some port forwarding had to be made:
- API Gateway - 8080
- SwaggerUI - 8081
- Lobby Service - 3000
- Game Service - 3001
- Auth Service - 3002
- Mongo - 27020

**Examples:**<br>
The Lobby Service trying to connect to the MongoDB would use a url like this:<br>
mongodb://db_username:db_password@mongo:27017 - where 'mongo' is the name of a service in compose<br>
If you're running compose on your local machine and would want to connect to mongo directly (e.g. using a client like Compass), you would use:<br>
mongodb://db_username:db_password@localhost:27020

API Gateway trying to send a request to Lobby Service would use a url like this:<br>
GET http://lobby:8080/ - where 'lobby' is the name of a service in compose<br>
If you would want to request Lobby Service directly for debug reasons, you would use:<br>
GET http://localhost:3000/


## Docker config info
All the JS services and SwaggerUI are listening on the 8080 port by default. Mongo listens on it's default 27017 port.<br>
Those are the ports that the services would request each other by inside the docker network.

In order to send a request from the machine hosting the whole stack some port forwarding had to be made:
- API Gateway - 8080
- SwaggerUI - 8081
- Lobby Service - 3000
- Game Service - 3001
- Auth Service - 3002
- Mongo - 27020

**Examples:**<br>
The Lobby Service trying to connect to the MongoDB would use a url like this:<br>
mongodb://db_username:db_password@mongo:27017 - where 'mongo' is the name of a service in compose<br>
If you're running compose on your local machine and would want to connect to mongo directly (e.g. using a client like Compass), you would use:<br>
mongodb://db_username:db_password@localhost:27020

API Gateway trying to send a request to Lobby Service would use a url like this:<br>
GET http://lobby:8080/ - where 'lobby' is the name of a service in compose<br>
If you would want to request Lobby Service directly for debug reasons, you would use:<br>
GET http://localhost:3000/

## Monitoring
As monitoring/alerting tools this project uses:
- cAdvisor - provides container specific metrics
- Node-Exporter - provides host specific metrics
- Prometheus - collects metrics data
- Loki - aggregates logs from other containers, stores and indexes them
- Promtail - scrapes logs and actually stores them in Loki
- Grafana - used to visualize metrics sourced from Prometheus as well as allows querying logs from Loki

> Current compose config as well as other metric-collecting services' configs were created with a unix host in mind. Current configuration works fine on a MacOS with Docker Desktop for Mac and will *probably* work fine on another *nix system with Docker. Some monitoring services/functinality may or may not work on a Windows machine. This requires further testing/adjustments.

Grafana is available on a 8090 port. Currently it only has one admin user whose password can be looked up in envs passed to Grafana service (in compose file). Upon entering you should be able to view a single existing dashboard (Dashboards -> Browse -> General -> Metrics). It should look something like this:<br>
![Grafana dashboard](./misc/grafana_example.jpeg)

As for logs - those can be queried with Grafana in Explore section (be sure to select Loki as datasource) or from Loki itself which is available on 8094 on the host machine.

## Useful resources
Docker overview
https://youtu.be/gAkwW2tuIqE

Docker volumes
https://youtu.be/p2PH_YPCsis

JWT
https://youtu.be/7Q17ubqLfaM

Getting started with Node.js
https://nodejs.dev/en/learn/

Express
https://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm

WS
https://www.pubnub.com/blog/nodejs-websocket-programming-examples/

Mongoose getting started
https://mongoosejs.com/docs/