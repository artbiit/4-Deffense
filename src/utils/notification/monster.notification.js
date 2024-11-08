import configs from '../../configs/configs.js';
import makeNotification from './makeNotification.js';

/**
 * S2CEnemyMonsterDeathNotification 패킷을 생성하는 함수
 * @param {User} user 알림을 받을 유저
 * @param {Monster} monster 적이 처치한 몬스터
 * @returns {Buffer} 전송할 패킷
 */
export const createEnemyMonsterDeathNotification = (user, monster) => {
  const packetType = configs.packetType.ENEMY_MONSTER_DEATH_NOTIFICATION;
  const payload = { monsterId: monster.id };
  return makeNotification(packetType, payload, user);
};
