# Rock Paper Scissors backend
This repo contains a backend of a university group project for a subject called 'web applications'. The goal is to create an online rock paper scissoes game, where people will be able to play against each other.

Backend consists of several microservices each run in docker using compose. This repo contains all those microservies along with configuration files to run everything.
> One Repo to rule them all, One Repo to find them, One Repo to bring them all and in the docker bind them.


## Architecture and description
*Things you are gonna read down below might be a subject for constant change*

![Project architecture](./misc/img/architecture.jpeg)

Services:
- Game Service - a service that manages the game, saves the players' choices and provides the player with the choice of another player in a given round.
- Lobby Service - a service that allows browsing lobbies, creating own lobbies, connecting, as well as manages other in-lobby activities 
- Auth Service - provides registering and logging in functionality, as well ass issues auth tokens
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


## API
To view http endpoints available to the frontend please visit Swagger.<br>
Swagger is hosted as a separate service and is available under the 8081 port (unless you specifically changed your docker compose file).<br>

If you run the backend on your local machine, just open your browser of choice and proceed to http://localhost:8081/. Also take note of run options described above.


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
![Grafana dashboard](./misc/img/grafana_example.jpeg)

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

The ports on the local machine the services are forwarded to are expected to be passed as env variables. [E.g. as a file](.env)

### Examples
The Lobby Service trying to connect to the MongoDB would use a url like this:<br>
mongodb://db_username:db_password@mongo:27017 - where 'mongo' is the name of a service in compose<br>
If you're running compose on your local machine and would want to connect to mongo directly (e.g. using a client like Compass), you would use:<br>
mongodb://db_username:db_password@localhost:27020

API Gateway trying to send a request to Lobby Service would use a url like this:<br>
GET http://lobby:8080/ - where 'lobby' is the name of a service in compose<br>
If you would want to request Lobby Service directly for debug reasons, you would use:<br>
GET http://localhost:3000/

### Important
The port exposure must only be done in dev scenarios and for debug purposes.<br>
In a prod scenario the backend services **MUST UNDER NO CIRCUMSTANCE** be available from the external network (exposed to the internet). The only services that are supposed to be available to the outside world are:
- API Gateway - serves the available API
- SwaggerUI - documents the API Gateway's HTTP endpoints and serves as a how-to instruction on using the API
- Grafana - for viewing metrics and logs; is protected by it's own auth

Therefore, if you're a dev, you're running the backend on (for example) your own machine, and are in need of direct access to a certain service, you may just uncomment the "ports" section of the service in the compose file. By doing so you'll expose and forward a certain port on the host to a port of the app in a container.


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

### Docker Swarm
There is an option of running the backend as a stack in a docker swarm. For this you may use [this compose file](./docker-deploy.yml). It has a few differences to an already existing compose file due to some swarm specifics.

To initialize a swarm:<br>
`docker swarm init --advertise-addr <your ip>`<br>
--advertise-addr option may or may not be necessary in your case.

If you wish to create a multi-node swarm, you'll need to join other hosts to your swarm using a token obtained in a previous step:<br>
`docker swarm join --token <your token> <address>`

Then create user-defined overlay networks:<br>
`docker network create -d overlay rps_ext`<br>
`docker network create -d overlay --internal rps_int`

Then to deploy a stack in project directory run:<br>
`env $(cat .env) docker stack deploy -c ./docker-deploy.yml rps`<br>
you may use a differnt stack name if you wish.

#### Notes 
Using two machines in the same local home network, one with MacOS, another with Win10 and Docker for Desktop [I](https://github.com/Neterpila) wasn't able to join them into a single swarm. Apparently, judging from the forum/blog posts, open issues and complaints from other users, this is a Docker problem. Swarm isn't well supported on MacOS and Windows and Docker itself in its tutorials recommends using Linux machines for establishing multi-node swarms. From what I've read it is required for at least the manager node to be a Linux machine.

Another issue you may run into is that after depolying a stack everything seems to be fine, however you cannot access your services by e.g. HTTP by requesting 'localhost:\<port\>', even though the services have their ports published (and everything also works fine in compose mode). I've run into this as well using a MacOS machine. I wasn't able to solve this and assume it is yet another swarm issue with non-Linux OS.

Long story short, if you want to work with docker swarm on your PC without annoying troubles - you need to have a Linux as your OS. Otherwise, for dev purposes consider using the compose mode. As for production solution - you definetely need a server with some Linux distro.

### Hub
The project specific service images live here:<br>
https://hub.docker.com/repositories/neterpila


## How to contribute?
1. Create a branch for a feature you want to add
2. Push the branch to origin
2. Create a pull request and request a review from one of the team members


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