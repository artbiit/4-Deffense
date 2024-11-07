import { gameSessions, gamesJoinedbyUsers } from './sessions.js';
import Game from '../classes/models/game.class.js';
import { getUserById, getUserBySocket } from './user.session.js';

export const addGameSession = (id) => {
  const session = new Game(id);
  gameSessions.push(session);
  return session;
};

export const removeGameSession = (id) => {
  const index = gameSessions.findIndex((session) => session.id === id);
  if (index !== -1) {
    return gameSessions.splice(index, 1)[0];
  }
};

export const getGameSession = (id) => {
  return gameSessions.find((session) => session.id === id);
};

/**
 * @param {User} user
 * @returns {Game} gameSession
 */
export const getGameSessionByUser = (user) => {
  return gamesJoinedbyUsers.get(user);
};

/**
 * @param {string} userId
 * @returns {Game} gameSession
 */
export const getGameSessionByUserId = (userId) => {
  const user = getUserById(userId);
  return gamesJoinedbyUsers.get(user);
};

/**
 * @param {net.Socket} socket
 * @returns {Game} gameSession
 */
export const getGameSessionBySocket = (socket) => {
  const user = getUserBySocket(socket);
  return gamesJoinedbyUsers.get(user);
};


export const getAllGameSessions = () => {
  return gameSessions;
};
