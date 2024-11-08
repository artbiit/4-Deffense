import configs from '../../configs/configs.js';
import { getGameSessionByUser } from '../../session/game.session.js';
import { getUserBySocket } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

const { PacketType } = configs;

const monsterDeathHandler = ({ socket, payload }) => {
  try {
    const { monsterId } = payload;

    // 검증: 유저가 존재함
    const user = getUserBySocket(socket);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    // 검증: 유저가 게임에 참가함
    const gameSession = getGameSessionByUser(user);
    if (!gameSession) {
      throw new CustomError(ErrorCodes.USER_NOT_IN_GAME, '유저가 플레이중인 게임이 없습니다.');
    }

    // 검증: 게임이 진행중임
    const gameState = gameSession.state;
    if (gameState != 'inProgess') {
      throw new CustomError(ErrorCodes.GAME_NOT_IN_PROGRESS, `진행중인 게임이 아닙니다.`);
    }

    // 검증: 몬스터가 존재함
    const monster = gameSession.getMonster(user.id, monsterId);
    if (!monster) {
      throw new CustomError(ErrorCodes.MONSTER_NOT_FOUND, '몬스터를 찾을 수 없습니다.');
    }

    // 검증: 몬스터가 실제로 사망함
    if (!monster.isAlive) {
      throw new CustomError(ErrorCodes.MONSTER_NOT_DEAD, '몬스터가 죽지 않았습니다.');
    }

    // INCOMPLETE: 상대방에게 적 몬스터 처치 알림
  } catch (error) {
    handleError(PacketType.MONSTER_DEATH_NOTIFICATION, error);
  }
};

export default monsterDeathHandler;
