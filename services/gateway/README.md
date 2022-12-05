# API Gateway
The main idea behind this service is to have a centralzed entrypoint to the backend services. API Gateway should primarily handle such things as authorization, so the other services don't have to.
Target architecture assumes that only the gateway will be available from the internet, and the other services will be located in an internal docker network.

This service uses [KrakenD](https://www.krakend.io/docs/overview/) as the gateway solution, and in the service folder one will find configuration file for KrakenD's behaviour.