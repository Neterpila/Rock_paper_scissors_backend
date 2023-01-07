const express = require('express');
const bodyParser = require('body-parser');

const db = require('./db');

const app = express();
const expressWs = require('express-ws')(app);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(require('./app/auth/user_parser'));


app.use("/", require("./app/game/game.ws"));

app.use("/", require("./app/game/game.http"));

app.use(require('./app/error/handler'));

const port = 8080;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});

app.use('/health', async (req, res) => {
    res.status(200).send();
});

