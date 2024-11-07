import { PacketType } from '../../constants/header.js';
import makeNotification from './makeNotification.js';

/**
 * 기지 HP 상태 변경 중계 패킷 (S2CUpdateBaseHPNotification)
 * @param {boolean} isOpponent HP를 업데이트 할 기지가 상대방 기지라면 true
 * @param {number} baseHp 기지 체력
 * @param {User} user 유저
 * @returns
 */
export const createUpdateBaseHpNotification = (isOpponent, baseHp, user) => {
  const packetType = PacketType.UPDATE_BASE_HP_NOTIFICATION;
  const payload = { isOpponent, baseHp };
  return makeNotification(packetType, payload, user);
};

/**
 * 게임 오버 중계 패킷 (S2CGameOverNotification)
 * @param {boolean} isWin 받는 플레이어가 승리했으면 true
 * @param {User} user 유저
 * @returns
 */
export const createGameOverNotification = (isWin, user) => {
  //
  const packetType = PacketType.GAME_OVER_NOTIFICATION;
  const payload = { isWin };
  return makeNotification(packetType, payload, user);
};
