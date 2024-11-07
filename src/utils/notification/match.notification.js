import { getGameAssets } from '../../init/loadAssets.js';
import makeNotification from './makeNotification.js';
import configs from '../../configs/configs.js';
import logger from '../logger.js';
const { PacketType } = configs;
/**
 * message S2CMatchStartNotification {
    InitialGameState initialGameState = 1;
    GameState playerData = 2;
    GameState opponentData = 3;
}
    
message InitialGameState {
  int32 baseHp = 1;
  int32 towerCost = 2;
  int32 initialGold = 3;
  int32 monsterSpawnInterval = 4;
}

message GameState {
  int32 gold = 1;
  BaseData base = 2;
  int32 highScore = 3;
  repeated TowerData towers = 4;
  repeated MonsterData monsters = 5;
  int32 monsterLevel = 6;
  int32 score = 7;
  repeated Position monsterPath = 8;
  Position basePosition = 9;
}
  
message BaseData {
  int32 hp = 1;
  int32 maxHp = 2;
}
 * 
 */
export const matchSuccessNotification = async (gameSession) => {
  let user = null;
  try {
    const users = gameSession.users;

    const { bases, towers } = getGameAssets();
    const initialGameState = {
      baseHp: bases.data[0].maxHp,
      towerCost: towers.data[0].Cost,
      initialGold: 0,
      monsterSpawnInterval: gameSession.monsterSpawnInterval,
    };

    for (let i = 0; i < users.length; i++) {
      user = users[i];
      const socket = user.user.socket;
      const playerData = {
        gold: user.gold,
        base: {
          hp: bases.data[0].maxHp,
          maxHp: bases.data[0].maxHp,
        },
        highScore: user.user.bestScore,
        towers: [],
        monsters: [],
        monsterLevel: gameSession.monsterLevel,
        score: 0,
        monsterPath: user.monsterPath,
        basePosition: user.basePosition,
      };

      const opponent = gameSession.getOpponent(user.user.id);
      const opponentData = {
        gold: opponent.gold,
        base: {
          hp: bases.data[0].maxHp,
          maxHp: bases.data[0].maxHp,
        },
        highScore: opponent.user.bestScore,
        towers: [],
        monsters: [],
        monsterLevel: gameSession.monsterLevel,
        score: 0,
        monsterPath: opponent.monsterPath,
        basePosition: opponent.basePosition,
      };

      const data = makeNotification(PacketType.MATCH_START_NOTIFICATION, {
        initialGameState,
        playerData,
        opponentData,
      });
      socket.write(data);
    }
  } catch (error) {
    let userData = user ? JSON.stringify(user) : '';
    logger.error(`matchSuccessNotification. failed notification : ${error} : ${userData}`);
  }
};
