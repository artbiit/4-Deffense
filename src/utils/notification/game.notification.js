// import { handlerIds } from '../../handlers/index.js';
// import { createResponse } from '../response/createResponse.js';

import { PacketType } from '../../constants/header.js';

// export const createLocationPacket = (users) => {
//   return createResponse(handlerIds['gameNotification.LocationUpdate'], 0, { users }, null);
// };

// export const createPingPacket = (timestamp) => {
//   return createResponse(handlerIds['common.Ping'], 0, { timestamp }, null);
// };

export const makeNotification = () => {};

/**
 * S2CAddEnemyTowerNotification 패킷을 생성하는 함수
 * @param {User} user 알림을 받을 유저
 * @param {string} towerId 설치된 적 타워 ID
 * @param {number} x 설치된 적 타워 x 좌표
 * @param {number} y 설치된 적 타워 y 좌표
 * @returns {Buffer} 전송할 패킷
 */
export const createAddEnemyTowerNotification = (user, towerId, x, y) => {
  const packetType = PacketType.ADD_ENEMY_TOWER_NOTIFICATION;
  const payload = { towerId, x, y };
  return makeNotification(packetType, user, payload);
};
