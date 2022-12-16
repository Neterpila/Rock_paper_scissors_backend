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
    let lobbies = await Lobby.find(filters);
    return lobbies.map(l => {
        l = l.toObject();
        l.users = l.users.map(u => u.username);
        return l;
    });
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

    if(lobby.users.some(u => u.username === user))
        return lobby;

    if (lobby.users.length >= 2)
        throw {
            type: "lobby_full"
        }

    lobby.users.push({
        username: user
    });
    lobby = await lobby.save();
    return lobby;
}

async function leave(lobby_id, user) {
    let lobby = await findById(lobby_id);

    lobby.users = _.filter(lobby.users, u => u.username !== user);
    lobby = await lobby.save();

    return lobby;
}

async function getConnectedUsers(lobby_id) {
    return (await findById(lobby_id)).users;
}

async function clearConnectedUsers() {
    let lobbies = await Lobby.find();

    await Promise.all(lobbies.map(async lobby => {
        lobby.users = [];
        await lobby.save();
    }));
}

async function setReady(lobby_id, username, status) {
    let lobby = await Lobby.findById(lobby_id);
    if (!lobby.users.some(u => u.username === username))
        throw new Error(`User ${username} has not joined to lobby ${lobby_id}`);

    let connected_user = _.find(lobby.users, { username });
    let changed = connected_user.is_ready !== status;
    connected_user.is_ready = status;
    await lobby.save();
    return changed;
}

module.exports = { create, remove, get, join, leave, getConnectedUsers, clearConnectedUsers, setReady };