const express = require('express');
const bodyParser = require('body-parser');

const db = require('./db');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(require('./app/auth/jwt_decoder'));

app.use('/lobby', require('./app/lobby/lobby.controller'));

app.use(require('./app/error/handler'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});

require("./app/lobby/lobby.ws");

app.use('/health', async (req, res) => {
    res.status(200).send();
});
