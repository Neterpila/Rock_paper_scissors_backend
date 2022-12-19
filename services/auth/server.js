const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('./app/db');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

app.use(require("./app/auth"));

app.get("/health", (req, res) => {
    return res.status(200).send({ status: "ok" });
});

app.use(require("./app/error_handler"));

const port = 8080;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});