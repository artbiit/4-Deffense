import configs from "../configs/configs.js";
import CustomError from "../utils/error/customError.js";
import { ErrorCodes } from "../utils/error/errorCodes.js";
import towerAttackRequestHandler from "./attack/attack.handler.js";

const { PacketType } = configs;

const handlers = {
  [PacketType.REGISTER_REQUEST]: {
    handler: undefined,
    protoType: "C2SRegisterRequest",
  },
  [PacketType.REGISTER_RESPONSE]: {
    handler: undefined,
    protoType: "S2CRegisterResponse",
  },
  [PacketType.LOGIN_REQUEST]: {
    handler: undefined,
    protoType: "C2SLoginRequest",
  },
  [PacketType.LOGIN_RESPONSE]: {
    handler: undefined,
    protoType: "S2CLoginResponse",
  },
  [PacketType.MATCH_REQUEST]: {
    handler: undefined,
    protoType: "C2SMatchRequest",
  },
  [PacketType.MATCH_START_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CMatchStartNotification",
  },
  [PacketType.STATE_SYNC_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CStateSyncNotification",
  },
  [PacketType.TOWER_PURCHASE_REQUEST]: {
    handler: undefined,
    protoType: "C2STowerPurchaseRequest",
  },
  [PacketType.TOWER_PURCHASE_RESPONSE]: {
    handler: undefined,
    protoType: "S2CTowerPurchaseResponse",
  },
  [PacketType.ADD_ENEMY_TOWER_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CAddEnemyTowerNotification",
  },
  [PacketType.SPAWN_MONSTER_REQUEST]: {
    handler: undefined,
    protoType: "C2SSpawnMonsterRequest",
  },
  [PacketType.SPAWN_MONSTER_RESPONSE]: {
    handler: undefined,
    protoType: "S2CSpawnMonsterResponse",
  },
  [PacketType.SPAWN_ENEMY_MONSTER_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CSpawnEnemyMonsterNotification",
  },
  [PacketType.TOWER_ATTACK_REQUEST]: {
    handler: towerAttackRequestHandler,
    protoType: "C2STowerAttackRequest",
  },
  [PacketType.ENEMY_TOWER_ATTACK_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CEnemyTowerAttackNotification",
  },
  [PacketType.MONSTER_ATTACK_BASE_REQUEST]: {
    handler: undefined,
    protoType: "C2SMonsterAttackBaseRequest",
  },
  [PacketType.UPDATE_BASE_HP_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CUpdateBaseHPNotification",
  },
  [PacketType.GAME_OVER_NOTIFICATION]: {
    handler: undefined,
    protoType: "S2CGameOverNotification",
  },
  [PacketType.GAME_END_REQUEST]: {
    handler: undefined,
    protoType: "C2SGameEndRequest",
  },
  [PacketType.MONSTER_DEATH_NOTIFICATION]: {
    handler: undefined,
    protoType: "C2SMonsterDeathNotification",
  },
  [PacketType.ENEMY_MONSTER_DEATH_NOTIFICATION]: {
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
