import User from '../../classes/models/user.class.js';
import configs from '../../configs/configs.js';
import { PacketType } from '../../constants/header.js';
import { getFieldNameByHandlerId } from '../../handlers/index.js';
import { getProtoMessages } from '../../init/loadProtos.js';

const {
  PACKET_TYPE_LENGTH,
  PACKET_VERSION_LENGTH,
  PACKET_SEQUENCE_LENGTH,
  PACKET_PAYLOAD_LENGTH,
  CLIENT_VERSIONS,
} = configs;

/**
 * 중계 패킷 생성
 * @param {*} packetType 패킷타입
 * @param {*} payload 값
 * @param {*} user 유저정보
 * @returns
 */
const makeNotification = (packetType, payload, user) => {
  const packetTypeBuffer = Buffer.alloc(PACKET_TYPE_LENGTH);
  packetTypeBuffer.writeUintBE(packetType, 0, PACKET_TYPE_LENGTH);

  const version = CLIENT_VERSIONS;
  const versionBuffer = Buffer.from(version);
  const versionLengthBuffer = Buffer.alloc(PACKET_VERSION_LENGTH);
  versionLengthBuffer.writeUintBE(versionBuffer.length, 0, PACKET_VERSION_LENGTH);

  const sequenceBuffer = Buffer.alloc(PACKET_SEQUENCE_LENGTH);
  sequenceBuffer.writeUintBE(user?.getNextSequence() || 0, 0, PACKET_SEQUENCE_LENGTH);

  const protoMessages = getProtoMessages();
  const fieldName = getFieldNameByHandlerId(packetType);
  const data = {
    payload: fieldName,
    [fieldName]: payload,
  };
  const payloadBuffer = protoMessages.GamePacket.encode(data).finish();

  const payloadLengthBuffer = Buffer.alloc(PACKET_PAYLOAD_LENGTH);
  payloadLengthBuffer.writeUintBE(payloadBuffer.length, 0, PACKET_PAYLOAD_LENGTH);

  return Buffer.concat([
    packetTypeBuffer,
    versionLengthBuffer,
    versionBuffer,
    sequenceBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);
};

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
