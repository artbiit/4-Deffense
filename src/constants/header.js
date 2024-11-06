export const PACKET_TYPE_LENGTH = 2; // 패킷타입을 나타내는  길이
export const PACKET_VERSION_LENGTH = 1; //버전 문자열 길이
export const PACKET_SEQUENCE_LENGTH = 4; //시퀀스 데이터 길이
export const PACKET_PAYLOAD_LENGTH = 4; //페이로드 데이터 길이

export const PacketType = {
  // 회원가입 및 로그인
  REGISTER_REQUEST: 1,
  REGISTER_RESPONSE: 2,
  LOGIN_REQUEST: 3,
  LOGIN_RESPONSE: 4,

  // 매칭
  MATCH_REQUEST: 5,
  MATCH_START_NOTIFICATION: 6,

  // 상태 동기화
  STATE_SYNC_NOTIFICATION: 7,

  // 타워 구입 및 배치
  TOWER_PURCHASE_REQUEST: 8,
  TOWER_PURCHASE_RESPONSE: 9,
  ADD_ENEMY_TOWER_NOTIFICATION: 10,

  // 몬스터 생성
  SPAWN_MONSTER_REQUEST: 11,
  SPAWN_MONSTER_RESPONSE: 12,
  SPAWN_ENEMY_MONSTER_NOTIFICATION: 13,

  // 전투 액션
  TOWER_ATTACK_REQUEST: 14,
  ENEMY_TOWER_ATTACK_NOTIFICATION: 15,
  MONSTER_ATTACK_BASE_REQUEST: 16,

  // 기지 HP 업데이트 및 게임 오버
  UPDATE_BASE_HP_NOTIFICATION: 17,
  GAME_OVER_NOTIFICATION: 18,

  // 게임 종료
  GAME_END_REQUEST: 19,

  // 몬스터 사망 통지
  MONSTER_DEATH_NOTIFICATION: 20,
  ENEMY_MONSTER_DEATH_NOTIFICATION: 21,
};

export const ReversePacketType = Object.fromEntries(
  Object.entries(PacketType).map(([key, value]) => [value, key]),
);
