import { gamesJoinedbyUsers } from '../../session/sessions.js';
import { getUserById } from '../../session/user.session.js';
import IntervalManager from '../managers/interval.manager.js';
// import {
//   createLocationPacket,
//   gameStartNotification,
// } from '../../utils/notification/game.notification.js';

const MAX_PLAYERS = 2;

class Game {
  constructor(id) {
    this.id = id;
    this.users = [];
    this.intervalManager = new IntervalManager();
    this.state = 'waiting'; // 'waiting', 'inProgress'
    this.towers = {};
  }

  addUser(user) {
    if (this.users.length >= MAX_PLAYERS) {
      throw new Error('Game session is full');
    }

    this.users.push(user);
    gamesJoinedbyUsers.set(user, this);

    this.towers[user] = [];

    this.intervalManager.addPlayer(user.id, user.ping.bind(user), 1000);
    if (this.users.length === MAX_PLAYERS) {
      setTimeout(() => {
        this.startGame();
      }, 3000);
    }
  }

  getUser(userId) {
    return this.users.find((user) => user.id === userId);
  }

  removeUser(userId) {
    this.users = this.users.filter((user) => user.id !== userId);
    const user = getUserById(userId);
    gamesJoinedbyUsers.delete(user);

    delete this.towers[user];

    this.intervalManager.removePlayer(userId);

    if (this.users.length < MAX_PLAYERS) {
      this.state = 'waiting';
    }
  }

  /**
   * 상대방 유저를 조회하는 함수
   * @param {string} userId 기준이 되는 유저의 ID
   * @returns {User} 상대방 유저
   */
  getOpponent(userId) {
    return this.users.filter((user) => user.id !== userId)[0];
  }

  addTower(user, tower) {
    this.towers[user].push(tower);
  }

  getMaxLatency() {
    let maxLatency = 0;
    this.users.forEach((user) => {
      maxLatency = Math.max(maxLatency, user.latency);
    });
    return maxLatency;
  }

  startGame() {}

  getAllLocation() {}
}

export default Game;
