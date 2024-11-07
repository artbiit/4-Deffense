import { PacketType } from '../../constants/header.js';
import { makeNotification } from './makeNotification.js';

/**
 * S2CAddEnemyTowerNotification 패킷을 생성하는 함수
 * @param {User} user 알림을 받을 유저
 * @param {Tower} tower 설치된 적 타워
 * @returns {Buffer} 전송할 패킷
 */
export const createAddEnemyTowerNotification = (user, tower) => {
  const packetType = PacketType.ADD_ENEMY_TOWER_NOTIFICATION;
  const { towerId, x, y } = tower;
  const payload = { towerId, x, y };
  return makeNotification(packetType, user, payload);
};
