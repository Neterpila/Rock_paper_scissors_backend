## Requirements
1. ~~**Micro-servise based architecture**~~
2. ~~**Contenerization**~~
3. ~~**Security enforcement and testing**~~ - User authorization with JWT, manual Postman tests 
4. ~~**Performance tracking and monitoring**~~ - [see here](https://github.com/Neterpila/Rock_paper_scissors_backend#monitoring)
5. ~~Performance, resilliency and end2end tests~~ - There is a test plan for JMeter with different kinds of tests
6. Chaos testing
7. ~~Container orchestration and scalability~~ - [see here](https://github.com/Neterpila/Rock_paper_scissors_backend#docker-swarm)
8. ~~Log processing, auditing and alerting~~ - logs are collected to Loki, Grafana has an example alert
9. Discoverability and runtime reconfiguration
10. Stream and batch data processing
 
## Checklist
### Functional
- Create a frontend app with at least a few views and some functionality
- ~~Finish Game service (handling games, saving game history to db along with moves etc.)~~
- ~~Integrate Game service with Gateway​~~
- ~~Implement starting a new game from lobby​~~

### Non-functional
- ~~Add prometheus, grafana, cadvisor​~~
- ~~Transition from compose to swarm​~~
- ~~Collect logs to splunk/elastic~~
- ~~Research and add either discoverability services or performance tests in postman (or both)~~
