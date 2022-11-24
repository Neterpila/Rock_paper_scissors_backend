const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');

const fs = require('fs');
const jwk_path = './config/jwk.json';

if (!fs.existsSync(jwk_path))
    throw {
        message: "no jwk file found under " + jwk_path
    }

const db = require('./app/db');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

app.use(require("./app/auth"));

app.use("/jwk", express.static(jwk_path));

app.get("/health", (req, res) => {
    return res.status(200).send({ status: "ok" });
});

app.use(require("./app/error_handler"));

const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});