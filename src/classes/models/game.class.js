import IntervalManager from '../managers/interval.manager.js';
import configs from '../../configs/configs.js';
import Monster from './monster.class.js';
import { gamesJoinedbyUsers } from '../../session/sessions.js';
import { getUserById } from '../../session/user.session.js';
import { getGameAssets } from '../../init/loadAssets.js';
import { matchSuccessNotification } from '../../utils/notification/match.notification.js';

// import {
//   createLocationPacket,
//   gameStartNotification,
// } from '../../utils/notification/game.notification.js';

const { GAME_MAX_PLAYER } = configs;

class Game {
  constructor(id) {
    this.id = id;
    this.users = {
      length: 0,
    };
    this.intervalManager = new IntervalManager();
    this.monsterLevel = 1;
    this.state = 'waiting'; // 'waiting', 'inProgress'
    this.monsterSpawnInterval = 1000;
  }

  addUser(user) {
    if (this.users.length >= GAME_MAX_PLAYER) {
      throw new Error('Game session is full');
    }

    const { bases } = getGameAssets();

    this.users.length++;
    this.users[user.id] = {
      user,
      monsters: { length: 0 },
      towers: { length: 0 },
      monsterPath: [],
      basePosition: { x: 0, y: 0 },
      baseHp: bases.data[0].maxHp,
      gold: 0,
    };

    gamesJoinedbyUsers.set(user, this);
    this.intervalManager.addPlayer(user.id, user.ping.bind(user), 1000);

    if (this.users.length == GAME_MAX_PLAYER) {
      console.log(this.users.length, ' - ', GAME_MAX_PLAYER);
      setTimeout(() => {
        this.startGame();
      }, 3000);
    }
  }

  getUser(userId) {
    return this.users[userId].user;
  }

  removeUser(userId) {
    delete this.users[userId];
    this.intervalManager.removePlayer(userId);
    const user = getUserById(userId);
    gamesJoinedbyUsers.delete(user);

    if (this.users.length < GAME_MAX_PLAYER) {
      this.state = 'waiting';
    }
  }

  /**
   * 상대방 유저를 조회하는 함수
   * @param {string} userId 기준이 되는 유저의 ID
   * @returns {User} 상대방 유저
   */
  getOpponent(userId) {
    if (!this.users[userId]) {
      return null;
    }

    const userKeys = Object.keys(this.users);
    for (let key of userKeys) {
      if (key !== userId) {
        return this.users[key];
      }
    }

    return null;
  }

  /**
   * 유저가 설치한 타워를 해당 게임의 타워목록에 추가하는 함수
   * @param {User} user 타워를 설치한 유저
   * @param {Tower} tower 설치한 타워
   */
  addTower(userId, tower) {
    this.users[userId].towers.length++;
    this.users[userId].towers[tower.id] = tower;
  }

  getMaxLatency() {
    let maxLatency = 0;
    this.users.forEach((user) => {
      maxLatency = Math.max(maxLatency, user.latency);
    });
    return maxLatency;
  }

  getTower(userId, towerId) {
    return this.users[userId].towers[towerId];
  }
  getMonster(userId, monsterId) {
    return this.users[userId].monsters[monsterId];
  }

  startGame() {
    this.state = 'in_progress';
    matchSuccessNotification(this);
  }

  getAllLocation() {}

  // 유저의 몬스터 추가
  addMonster(userId, monsterNumber) {
    //생성된 순서대로 번호를 부여하면 서로 겹칠일 없음.
    const id = ++this.monsters[userId].length;
    const monster = new Monster(id, monsterNumber, this.monsterLevel);
    this.users[userId].monsters[id] = monster; // 해당 유저의 몬스터 목록에 몬스터 추가
    //이 유저가아닌 상대 유저한테 noti해야함
    return monster.id;
  }
}

export default Game;
