const express = require('express');
const app = express();
const jwt_validator = require("./app/auth/jwt_validator");
const bodyParser = require('body-parser');
const cors = require('cors');

require('express-ws')(app, null, {
    wsOptions: { 
        verifyClient: ({ req }, done) => {
            jwt_validator(req.headers.authorization).then(payload => {
                req.user = payload;
                return done(true);
            }).catch(e => {
                return done(false, 401);
            })
        }
    }
});

app.use(cors({credentials: true, origin: true}));

const ws_backend = require("./app/ws/backend");
const ws_clients = require("./app/ws/clients");

// backend module needs an instance of clients module and vice versa
// node 15+ does not tolerate circular dependencies
// e.i. you can't require("file1") from file2 and vice versa
// this is a somewhat ugly but working solution
ws_backend.init(ws_clients);
ws_clients.init(ws_backend);

app.use("/", ws_clients.router);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use("/", require("./app/http/proxy"));

app.get('/health', function(req, res, next){
    res.status(200).send();
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});
