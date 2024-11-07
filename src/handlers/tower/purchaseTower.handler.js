import { getGameSessionByUser } from '../../session/game.session.js';
import Tower from '../../classes/models/tower.class';
import { getUserBySocket } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler';
import configs from '../../configs/configs.js';
import { createResponse } from '../../utils/response/createResponse.js';
import { createAddEnemyTowerNotification } from '../../utils/notification/game.notification.js';

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

    // INCOMPLETE: 타워 위치 (설치할 수 있는 곳인가? 다른 타워와 겹치는가?) 검증 필요
    // INCOMPLETE: 골드가 충분한지 검증 필요

    const tower = new Tower({ x, y });
    gameSession.addTower(user, tower);

    // S2CTowerPurchaseResponse 패킷 전송
    const purchaseTowerResponseData = { towerId: tower.id };
    const purchaseTowerResponse = createResponse(
      PacketType.TOWER_PURCHASE_RESPONSE,
      user,
      purchaseTowerResponseData,
    );
    socket.write(purchaseTowerResponse);

    // S2CAddEnemyTowerNotification 패킷 전송
    const opponent = gameSession.getOpponent(user.id);
    if (!opponent) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    const addEnemyTowerResponse = createAddEnemyTowerNotification(opponent, tower);
    socket.write(addEnemyTowerResponse);
  } catch (error) {
    handleError(PacketType.TOWER_PURCHASE_REQUEST, error);
  }
};

export default purchaseTower;
