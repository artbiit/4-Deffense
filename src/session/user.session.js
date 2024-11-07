import User from '../classes/models/user.class.js';
import logger from '../utils/logger.js';
import game from '../classes/models/game.class.js';
import { gamesJoinedbyUsers } from './sessions.js';


export const userSessions = [];

export const addUser = (socket, uuid) => {
  const user = new User(uuid, socket);
  userSessions.push(user);
  gamesJoinedbyUsers.set(user, undefined);
  return user;
};

export const removeUser = (socket) => {
  const index = userSessions.findIndex((user) => user.socket === socket);

  if (index !== -1) {
    const user = getUserBySocket(socket);
    gamesJoinedbyUsers.delete(user);

    return userSessions.splice(index, 1)[0];
  }
};

export const getUserById = (id) => {
  return userSessions.find((user) => user.id === id);
};

export const getUserByDeviceId = (deviceId) => {
  return userSessions.find((user) => user.deviceId === deviceId);
};

export const getUserBySocket = (socket) => {
  return userSessions.find((user) => user.socket === socket);
};
