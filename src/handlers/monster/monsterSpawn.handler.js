import { RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { getGameAssets } from '../../init/loadAssets.js'; // getGameAssets 사용해야하나 ?
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';
import { createResponse } from '../../utils/response/createResponse.js';
import {
  addMonsterToGameSession,
  getGameSession,
  getGameSessionByUserId,
} from '../../session/game.session.js';
import config from '../../configs/configs.js';

const { PacketType } = config;

export const SpawnMonsterRequestHandler = ({ socket, userId, payload }) => {
  try {
    // 소켓으로 유저 찾기
    const user = getUserBySocket(socket);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '해당 유저를 찾을 수 없습니다.');
    }
    // getGameSessionByUser 로 게임 세션 찾기 ?
    // 아니면 user.id로 게임 세션 찾기?
    const gameSession = getGameSessionByUserId(user.id);
    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '해당 게임 세션을 찾을 수 없습니다.');
    }

    // UUID로 고유한 몬스터 ID 생성
    const uniqueMonsterId = uuidv4();

    // 1~5 사이의 monsterNumber 생성
    const monsterNumber = `MON0000${Math.floor(Math.random() * 5) + 1}`;

    // 세션에 넣을 몬스터 정보
    const newMonster = {
      id: uniqueMonsterId,
      monsterNumber: monsterNumber,
      level: payload.level || 1, // payload에서 level을 가져오거나 기본레벨 1
    };

    // 게임 세션에 몬스터 추가
    addMonsterToGameSession(socket, newMonster);

    // 몬스터 생성 응답
    const spawnMonsterResponse = createResponse(PacketType.SPAWN_MONSTER_RESPONSE, user, {
      monsterId: uniqueMonsterId,
      monsterNumber: monsterNumber,
      message: '몬스터가 성공적으로 생성되었습니다.',
    });

    socket.write(spawnMonsterResponse);
  } catch (error) {
    handleError(error);
  }
};
/* message S2CSpawnMonsterResponse {
    int32 monsterId = 1;
    int32 monsterNumber = 2;
    }
    monsterId는 고유한 값으로 관리를 위해서 보내주면 되고
    monsterNumber는 1~5사이 값 아무거나 보내면 클라이언트에서 매핑해주셔가지고 MON00001 이런식으로 해결해주신다고 합니다. */
