import { addMonsterToGameSession } from '../../session/game.session.js';
import config from '../../configs/configs.js';
import Result from '../result.js';

const { PacketType } = config;

export const SpawnMonsterRequestHandler = ({ socket, payload }) => {
  // 1~5 사이의 monsterNumber 생성
  const monsterNumber = Math.floor(Math.random() * 5) + 1;

  // 게임 세션에 몬스터 추가
  const monsterId = addMonsterToGameSession(socket, monsterNumber);

  if (monsterId) {
    console.log(`몬스터 추가 됨 : ${monsterId}`);
    const result = new Result({ monsterId, monsterNumber }, PacketType.SPAWN_MONSTER_RESPONSE);
    return result;
  }
};
/* message S2CSpawnMonsterResponse {
    int32 monsterId = 1;
    int32 monsterNumber = 2;
    }
    monsterId는 고유한 값으로 관리를 위해서 보내주면 되고
    monsterNumber는 1~5사이 값 아무거나 보내면 클라이언트에서 매핑해주셔가지고 MON00001 이런식으로 해결해주신다고 합니다. */
