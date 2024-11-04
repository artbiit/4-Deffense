import configs from "../configs/configs.js";
import CustomError from "../utils/error/customError.js";
import { ErrorCodes } from "../utils/error/errorCodes.js";

const { PACKET_TYPE } = configs;

const handlers = {
  [PACKET_TYPE.REGISTER_REQUEST]: {
    handler: undefined,
    protoType: "C2SRegisterRequest",
  },
  [PACKET_TYPE.REGISTER_RESPONSE]: {
    handler: undefined,
    protoType: "S2CRegisterResponse",
  },
  [PACKET_TYPE.LOGIN_REQUEST]: {
    handler: undefined,
    protoType: "C2SLoginRequest",
  },
  [PACKET_TYPE.LOGIN_RESPONSE]: {
    handler: undefined,
    protoType: "S2CLoginResponse",
  },
  [PACKET_TYPE.MATCH_REQUEST]: {
    handler: undefined,
    protoType: "C2SMatchRequest",
  },
  [PACKET_TYPE.MATCH_START_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CMatchStartNotification",
  },
  [PACKET_TYPE.STATE_SYNC_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CStateSyncNotification",
  },
  [PACKET_TYPE.TOWER_PURCHASE_REQUEST]: {
    handler: undefined,
    protoType: "C2STowerPurchaseRequest",
  },
  [PACKET_TYPE.TOWER_PURCHASE_RESPONSE]: {
    handler: undefined,
    protoType: "S2CTowerPurchaseResponse",
  },
  [PACKET_TYPE.ADD_ENEMY_TOWER_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CAddEnemyTowerNotification",
  },
  [PACKET_TYPE.SPAWN_MONSTER_REQUEST]: {
    handler: undefined,
    protoType: "C2SSpawnMonsterRequest",
  },
  [PACKET_TYPE.SPAWN_MONSTER_RESPONSE]: {
    handler: undefined,
    protoType: "S2CSpawnMonsterResponse",
  },
  [PACKET_TYPE.SPAWN_ENEMY_MONSTER_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CSpawnEnemyMonsterNotification",
  },
  [PACKET_TYPE.TOWER_ATTACK_REQUEST]: {
    handler: undefined,
    protoType: "C2STowerAttackRequest",
  },
  [PACKET_TYPE.ENEMY_TOWER_ATTACK_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CEnemyTowerAttackNotification",
  },
  [PACKET_TYPE.MONSTER_ATTACK_BASE_REQUEST]: {
    handler: undefined,
    protoType: "C2SMonsterAttackBaseRequest",
  },
  [PACKET_TYPE.UPDATE_BASE_HP_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CUpdateBaseHPNotification",
  },
  [PACKET_TYPE.GAME_OVER_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CGameOverNotification",
  },
  [PACKET_TYPE.GAME_END_REQUEST]: {
    handler: undefined,
    protoType: "C2SGameEndRequest",
  },
  [PACKET_TYPE.MONSTER_DEATH_NOTIFICATION]: {
    handler: undefined,
    protoType: "C2SMonsterDeathNotification",
  },
  [PACKET_TYPE.ENEMY_MONSTER_DEATH_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CEnemyMonsterDeathNotification",
  },
};

export const getHandlerById = (handlerId) => {
  if (!handlers[handlerId]) {
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `핸들러를 찾을 수 없습니다: ID ${handlerId}`
    );
  }
  return handlers[handlerId].handler;
};

export const getProtoTypeNameByHandlerId = (handlerId) => {
  if (!handlers[handlerId]) {
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `핸들러를 찾을 수 없습니다: ID ${handlerId}`
    );
  }
  return handlers[handlerId].protoType;
};
