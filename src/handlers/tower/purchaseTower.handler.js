import { getGameSessionByUser } from '../../session/game.session.js';
import Tower from '../../classes/models/tower.class';
import { getUserBySocket } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler';
import configs from '../../configs/configs.js';
import { createResponse } from '../../utils/response/createResponse.js';

const { PacketType } = configs;

const purchaseTower = ({ socket, payload }) => {
  try {
    const { x, y } = payload;

    const user = getUserBySocket(socket);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    const gameSession = getGameSessionByUser(user);
    if (!gameSession) {
      throw new CustomError(ErrorCodes.USER_NOT_IN_GAME, '유저가 플레이중인 게임이 없습니다.');
    }

    const tower = new Tower({ x, y });
    gameSession.addTower(user, tower);

    const responseData = { towerId: tower.id };
    const response = createResponse(PacketType.TOWER_PURCHASE_RESPONSE, user, responseData);
    socket.write(response);
  } catch (error) {
    handleError(PacketType.TOWER_PURCHASE_REQUEST, error);
  }
};

export default purchaseTower;
