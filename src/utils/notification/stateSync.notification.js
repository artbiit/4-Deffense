import makeNotification from './makeNotification.js';
import { PacketType } from '../../constants/header.js';

/**
 * S2CStateSyncNotification 패킷을 생성하는 함수
 * @param {number} userGold 유저 보유 골드
 * @param {number} baseHp 기지 체력
 * @param {number} monsterLevel 몬스터 레벨
 * @param {number} score 점수
 * @returns {Buffer} 전송할 패킷
 */
export const stateSyncNotification = (payload, user) => {
  const packetType = PacketType.STATE_SYNC_NOTIFICATION;
  return makeNotification(packetType, payload, user);
};
