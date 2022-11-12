const Lobby = require('./lobby');
const _ = require('lodash');

async function create(data) {
    let lobby;
    try {
        lobby = new Lobby(_.pick(data, ["name", "password"]));
        lobby = await lobby.save();
    } catch (e) {
        throw {
            type: "invalid_data"
        }
    }
    return lobby;
}

async function get(filters = {}) {
    return Lobby.find(filters);
}

async function join(lobby_id, user_id) {
    let lobby = await Lobby.findById(lobby_id);
    if (!lobby)
        throw {
            type: "lobby_does_not_exist"
        }

    if (lobby.players.length >= 2)
        throw {
            type: "lobby_full"
        }

    if (!lobby.players.includes(user_id)) {
        lobby.players.push(user_id);
        lobby = await lobby.save();
    }
    return lobby;
}

module.exports = { create, get, join };