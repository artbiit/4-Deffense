import { gameSessions } from './sessions.js';
import Game from '../classes/models/game.class.js';

export const addGameSession = (id) => {
  const session = new Game(id);
  session.monsters = {}; // 세션에 몬스터 리스트를 추가
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

export const addMonsterToGameSession = (socket, monster) => {
  const session = getGameSession(socket);
  if (session) {
    session.monsters.push(monster);
    return true; // 성공적으로 추가했음을 반환
  }
  return false; // 세션이 없으면 false 반환
};

export const getGameSessionByUser = (user) => {};

export const getGameSessionByUserId = (userId) => {};

export const getAllGameSessions = () => {
  return gameSessions;
};
