//require("dotenv").config();
const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('./db');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

app.use(require("./app/auth"));

app.get("/protected_resource", require("./app/validate"), (req, res) => {
    //console.log(req);
    res.status(200).send({ message: "Welcome " + req.user.nickname + "! You gained access to classified information." });
});

app.use(require("./app/error_handler"));

const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});