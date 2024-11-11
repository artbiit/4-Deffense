import IntervalManager from '../managers/interval.manager.js';
import configs from '../../configs/configs.js';
import Monster from './monster.class.js';
import { gamesJoinedbyUsers } from '../../session/sessions.js';
import { getUserById } from '../../session/user.session.js';
import Tower from './tower.class.js';
import { getGameAsset } from '../../utils/asset/getAssets.js';
import { matchSuccessNotification } from '../../utils/notification/match.notification.js';
import {
  createGameOverNotification,
  createUpdateBaseHpNotification,
} from '../../utils/notification/base.notification.js';
import { stateSyncNotification } from '../../utils/notification/stateSync.notification.js';
import {
  INITIAL_GOLD,
  MONSTER_SPAWN_INTERVAL,
  NUM_SYNC_PER_LEVEL,
  SYNC_INTERVAL,
} from '../../constants/game.js';

// import {
//   createLocationPacket,
//   gameStartNotification,
// } from '../../utils/notification/game.notification.js';

const { GAME_MAX_PLAYER, ASSET_TYPE } = configs;

class Game {
  #monsterPath = [];
  #basePosition = {};
  #towerCount = 0;
  #monsterCount = 0;
  constructor(id) {
    this.id = id;
    this.#generatePath();

    this.users = {
      length: 0,
    };

    this.intervalManager = new IntervalManager();
    this.monsterLevel = 1;
    this.monsterspawnInterval = MONSTER_SPAWN_INTERVAL;
    this.state = 'waiting'; // 'waiting', 'in_progress'
    this.numSyncUntilNextLevel = NUM_SYNC_PER_LEVEL * 2;
  }

  startGame() {
    this.state = 'in_progress';
    matchSuccessNotification(this);
  }

  addUser(user) {
    if (this.users.length >= GAME_MAX_PLAYER) {
      throw new Error('Game session is full');
    }

    const bases = getGameAsset(ASSET_TYPE.BASE);

    this.users.length++;
    this.users[user.id] = {
      user,
      monsters: { length: 0 },
      towers: { length: 0 },
      baseHp: bases.data[0].maxHp,
      gold: INITIAL_GOLD,
      score: 0,
    };

    gamesJoinedbyUsers.set(user, this);

    this.intervalManager.addPlayer(user.id, () => this.stateSync(user), SYNC_INTERVAL);
    if (this.users.length == GAME_MAX_PLAYER) {
      setTimeout(() => {
        this.startGame();
      }, 1000);
    }
  }

  removeUser(userId) {
    if (this.users.length == 0) {
      return;
    }
    this.users.length--;
    delete this.users[userId];
    this.intervalManager.removePlayer(userId);

    const user = getUserById(userId);
    gamesJoinedbyUsers.delete(user);

    if (this.users.length < GAME_MAX_PLAYER) {
      this.state = 'waiting';
    }
  }

  getUser(userId) {
    return this.users[userId].user;
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
      if (key != userId) {
        return this.users[key];
      }
    }

    return null;
  }

  // 유저의 몬스터 추가
  addMonster(userId, monsterNumber) {
    //생성된 순서대로 번호를 부여하면 서로 겹칠일 없음.
    this.#monsterCount++;
    const monster = new Monster(this.#monsterCount, monsterNumber, this.monsterLevel);
    const monsters = this.users[userId].monsters;
    monsters[this.#monsterCount] = monster; // 해당 유저의 몬스터 목록에 몬스터 추가

    //이 유저가아닌 상대 유저한테 noti해야함
    return monster.id;
  }

  getMonster(userId, monsterId) {
    return this.users[userId].monsters[monsterId];
  }

  /**
   * 유저가 설치한 타워를 해당 게임의 타워목록에 추가하는 함수
   * @param {string} userId 타워를 설치한 유저의 ID
   * @param {{x: Number, y: Number}} coords 설치할 좌표
   */
  addTower(userId, coords) {
    this.#towerCount++;
    const tower = new Tower(this.#towerCount, coords);
    const towers = this.users[userId].towers;
    towers[this.#towerCount] = tower;
    return tower;
  }

  getTower(userId, towerId) {
    return this.users[userId].towers[towerId];
  }

  updateScore(userId, deltaScore) {
    const userStats = this.users[userId];
    const user = userStats.user;

    userStats.score += deltaScore;

    // 베스트스코어 업데이트
    if (userStats.score > user.bestScore) {
      user.bestScore = userStats.score;
    }
    return userStats.score;
  }

  updateGold(userId, deltaGold) {
    return (this.users[userId].gold += deltaGold);
  }

  monsterLevelIncrease() {
    if (--this.numSyncUntilNextLevel <= 0) {
      this.numSyncUntilNextLevel = NUM_SYNC_PER_LEVEL * 2;
      this.monsterLevel++;
    }
  }

  baseDamage(userId, damage) {
    const gameUser = this.users[userId];

    gameUser.baseHp -= damage;

    // * 유저의 변경된 기지 체력
    const updatedBaseHp = gameUser.baseHp;

    // * 내 기지 체력 변경 알림
    const myUpdateBaseHpNotification = createUpdateBaseHpNotification(
      false,
      updatedBaseHp,
      gameUser.user,
    );
    gameUser.user.socket.write(myUpdateBaseHpNotification);

    // * 상대방에게 기지 체력 변경 알림
    const opponent = this.getOpponent(userId);
    const opponentUpdateBaseHpNotification = createUpdateBaseHpNotification(
      true,
      updatedBaseHp,
      opponent.user,
    );
    opponent.user.socket.write(opponentUpdateBaseHpNotification);

    if (updatedBaseHp <= 0) {
      gameUser.baseHp = 0;
      // 베이스 펑
      // 게임종료.

      // * 나에게 게임 오버 알림
      const myGameOverNotification = createGameOverNotification(false);
      gameUser.user.socket.write(myGameOverNotification);

      // * 상대에게 게임 오버 알림
      const opponentGameOverNotification = createGameOverNotification(true);
      opponent.user.socket.write(opponentGameOverNotification);
    }
    return gameUser.baseHp;
  }

  stateSync(user) {
    // 검증: 게임이 시작했는가?(조건 변경 필요)
    if (this.state != 'in_progress') {
      console.error('게임이 아직 시작되지 않았습니다.(한명 기다려야 되서 한번은 뜸)');
      return;
    }

    // 검증: 게임 세션에 유저가 존재하는가?
    const gameSession = this.users[user.id];
    if (!gameSession) {
      console.error('유저를 찾을 수 없습니다');
      return;
    }

    // 몬스터 레벨 증가 로직(20초마다 monsterLevel 1씩 증가)
    this.monsterLevelIncrease();

    // 송신 데이터
    const data = {
      userGold: gameSession.gold,
      baseHp: gameSession.baseHp,
      monsterLevel: this.monsterLevel,
      score: gameSession.score,
    };

    // 송신
    const buffer = stateSyncNotification(data, user);
    user.socket.write(buffer);
  }

  getPlayerData = (userId) => {
    const gameUser = this.users[userId];
    if (!gameUser) {
      return null;
    }

    const bases = getGameAsset(ASSET_TYPE.BASE);
    //const user = gameUser.user;
    return {
      gold: gameUser.gold,
      base: {
        hp: bases.data[0].maxHp,
        maxHp: bases.data[0].maxHp,
      },
      //highScore: user.bestScore,
      highScore: gameUser.bestScore,
      towers: [],
      monsters: [],
      monsterLevel: this.monsterLevel,
      //score: 0,
      score: gameUser.score,
      monsterPath: this.#monsterPath,
      basePosition: this.#basePosition,
    };
  };

  getSyncData = (userId) => {
    const gameUser = this.users[userId];
    if (!gameUser) {
      return null;
    }

    return {
      userGold: gameUser.gold,
      baseHp: gameUser.baseHp,
      monsterLevel: this.monsterLevel,
      score: gameUser.score,
    };
  };

  getMaxLatency() {
    let maxLatency = 0;
    this.users.forEach((user) => {
      maxLatency = Math.max(maxLatency, user.latency);
    });
    return maxLatency;
  }

  #generatePath = () => {
    const path = [];

    path.push({ x: 0, y: 200 });
    path.push({ x: 200, y: 200 });
    path.push({ x: 200, y: 300 });
    path.push({ x: 100, y: 300 });
    path.push({ x: 100, y: 400 });
    path.push({ x: 300, y: 400 });
    path.push({ x: 300, y: 200 });
    path.push({ x: 400, y: 200 });
    path.push({ x: 400, y: 400 });
    path.push({ x: 600, y: 400 });
    path.push({ x: 600, y: 300 });
    path.push({ x: 500, y: 300 });
    path.push({ x: 500, y: 200 });
    path.push({ x: 700, y: 200 });
    path.push({ x: 700, y: 400 });
    path.push({ x: 1100, y: 400 });
    path.push({ x: 1100, y: 300 });
    path.push({ x: 800, y: 300 });
    path.push({ x: 800, y: 200 });
    path.push({ x: 1200, y: 200 });
    path.push({ x: 1200, y: 350 });
    path.push({ x: 1370, y: 350 });

    this.#monsterPath = path;
    this.#basePosition = { x: 1370, y: 350 };
    return;

    // const pathCount = 20;
    // const maxX = 1370;

    // const yPosRange = { min: 205.0, max: 400.0 };
    // const xStep = maxX / pathCount;
    // const minVerticalDistance = 100;
    // const minHorizontalDistance = 100;

    // let isVertical = true;
    // let prevX = 0;
    // let prevY = Math.floor(Math.random() * (yPosRange.max - yPosRange.min) + yPosRange.min);

    // for (let i = 0; i < pathCount - 1; i++) {
    //   let x, y;
    //   if (isVertical) {
    //     x = prevX;
    //     let yCandidate;
    //     do {
    //       yCandidate = Math.floor(Math.random() * (yPosRange.max - yPosRange.min) + yPosRange.min);
    //     } while (Math.abs(yCandidate - prevY) < minVerticalDistance);
    //     y = yCandidate;
    //   } else {
    //     let xCandidate;
    //     do {
    //       xCandidate = Math.floor(i * xStep + Math.random() * xStep);
    //     } while (Math.abs(xCandidate - prevX) < minHorizontalDistance);
    //     x = xCandidate;
    //     y = prevY;
    //   }
    //   path.push({ x, y });
    //   prevX = x;
    //   prevY = y;
    //   isVertical = !isVertical;
    // }

    // // 마지막 경로는 기지 좌표로 이어지도록 설정
    // const basePos = {
    //   x: maxX,
    //   y: prevY,
    // };
    // path.push(basePos);

    // this.#monsterPath = path;
    // this.#basePosition = basePos;
  };
}

export default Game;
