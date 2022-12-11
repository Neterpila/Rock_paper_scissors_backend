const Lobby = require('./lobby');
const _ = require('lodash');

async function create(data, owner) {
    let lobby;
    try {
        lobby = _.pick(data, ["name", "password"]);
        lobby.owner = owner;
        lobby = new Lobby(lobby);
        await lobby.save();
    } catch (e) {
        console.error(e);
        throw {
            type: "invalid_data"
        }
    }

    return lobby;
}

async function remove(lobby_id, owner) {
    let lobby = await findById(lobby_id);

    if (lobby.owner !== owner)
        throw {
            type: "not_an_owner"
        }

    await Lobby.deleteOne(lobby);
    return;
}

async function get(filters = {}) {
    return await Lobby.find(filters);
}

async function findById(id) {
    try {
        let lobby = await Lobby.findById(id);
        if (!lobby)
            throw new Error();
        return lobby;
    } catch (e) {
        throw {
            type: "does_not_exist"
        }
    }
}

async function join(lobby_id, user) {
    let lobby = await findById(lobby_id);

    if(lobby.players.includes(user))
        return lobby;

    if (lobby.players.length >= 2)
        throw {
            type: "lobby_full"
        }

    lobby.players.push(user);
    lobby = await lobby.save();
    return lobby;
}

async function leave(lobby_id, user) {
    let lobby = await findById(lobby_id);

    lobby.players = _.filter(lobby.players, player => player !== user);
    lobby = await lobby.save();

    return lobby;
}

async function getConnectedUsers(lobby_id) {
    return (await findById(lobby_id)).players;
}

async function clearConnectedUsers() {
    let lobbies = await Lobby.find();

    await Promise.all(lobbies.map(async lobby => {
        lobby.players = [];
        await lobby.save();
    }));
}

module.exports = { create, remove, get, join, leave, getConnectedUsers, clearConnectedUsers };