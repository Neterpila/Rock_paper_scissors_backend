const Game = require('./game');
const _ = require('lodash');

async function create(roundLimit) {
    let game;
    try {
        game = new Game(game);
        game.roundLimit = roundLimit;
        await game.save();
    } catch (e) {
        throw {
            type: "invalid_data"
        }
    }

    return game;
}

async function remove(id) {
    let game = await findById(id);

    await Game.deleteOne(game);
    return;
}


async function findById(id) {
    try {
        
        let game = await Game.findById(id);
        console.log(game);
        if (_.isEmpty(game))
            throw new Error();
        return game;
    } catch (e) {
        throw {
            type: "does_not_exist"
        }
    }
}

async function join(id, user) {
    let game = await findById(id);
    console.log("Game id : " + game.id);
    if(game.users.some(u => u.username === user.username))
        return game;

    if (game.users.length >= 2)
        throw {
            type: "game_full"
        }

    game.users.push({
        username: user.username
    });
    game = await game.save();
    return game;
}

async function leave(id, user) {
    let game = await findById(id);

    game.users = _.filter(game.users, u => u.username !== user);
    game = await game.save();

    return game;
}

async function getConnectedUsers(id) {
    return (await findById(id)).users;
}

async function clearConnectedUsers() {
    let games = await Game.find();

    await Promise.all(games.map(async game => {
        game.users = [];
        await game.save();
    }));

}

async function addPointRoundCounter(id,username) {
    let game = await Game.findById(id);
    user = game.users.filter(user => {
        return user.username === username
    })[0];
    user.score++;
    game.currentRound++;
    game.save();

}

async function saveChoiceAndMakeTurn(username,id,choice) {
    let game = await Game.findById(id);
    user = game.users.filter(user => {
        return user.username === username
    })[0];
    user.choice = choice;
    user.yourTurn = false;
    game.save();
}

async function endTurn(id) {
    let game = await Game.findById(id);
    game.users.forEach(user => {
        user.yourTurn = true;
        user.choice = "";
    })
    game.save();

}

async function get(filters = {}) {
    let games = await Game.find(filters);
    return games.map(l => {
        l = l.toObject();
        l.users = l.users.map(u => u.username);
        return l;
    });
}
async function getCurrentRound(id) {
    let game = await Game.findById(id);
    return game.currentRound;

}
async function getRoundLimit(id) {
    let game = await Game.findById(id);
    return game.roundLimit; 
}



module.exports = {create,get,saveChoiceAndMakeTurn, remove, join,findById, leave, 
    getConnectedUsers, clearConnectedUsers,addPointRoundCounter,endTurn,getCurrentRound,getRoundLimit};