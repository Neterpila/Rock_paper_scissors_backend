const mongoose = require('mongoose');

const MONGO_USERNAME = process.env.MONGO_USERNAME || 'admin';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'admin123';
const MONGO_HOSTNAME = process.env.MONGO_HOSTNAME || '127.0.0.1';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_DB = process.env.MONGO_DB || 'rock_paper_scissors';

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}`;
console.log(url);

connect();

function connect() {
    mongoose.connect(url, {useNewUrlParser: true}).then(() => {
        console.log("Connected to the database!");
    }).catch(err => {
        console.log("Cannot connect to the database!", err);
        console.log("Retrying in 10 seconds...");
        setTimeout(connect, 10000);
    });
}