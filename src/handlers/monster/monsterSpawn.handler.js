import { RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { getGameAssets } from '../../init/loadAssets.js'; // getGameAssets 사용해야하나 ?
import { getUserBySocket } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';
import { createResponse } from '../../utils/response/createResponse.js';

export const SpawnMonsterRequestHandler = ({ socket, payload }) => {
  try {
    const { monsterData } = payload;
    // 소켓으로 유저 세션을 찾기
    const user = getUserBySocket(socket);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '해당 유저를 찾을 수 없습니다.');
    }
    // monsterData가 존재하는지 확인
    if (!monsterData) {
      throw new CustomError(ErrorCodes.MISSING_FIELDS, '몬스터 데이터가 없습니다.');
    }
    // 새 몬스터 생성
    const newMonster = {
      id: uuidv4(),
      ...monsterData,
    };
    // 유저 세션에 몬스터 추가
    user.addMonster(newMonster);

    const spawnMonsterRequest = createResponse(RESPONSE_SUCCESS_CODE, user, {
      monsterId: newMonster.id,
      message: '몬스터가 성공적으로 생성되었습니다.',
    });

    socket.write(spawnMonsterRequest);
  } catch (error) {
    handleError(error);
  }
};
