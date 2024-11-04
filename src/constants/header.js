export const PACKET_TYPE_LENGTH = 2; // 패킷타입을 나타내는  길이
export const PACKET_VERSION_LENGTH = 1; //버전 문자열 길이
export const PACKET_SEQUENCE_LENGTH = 4; //시퀀스 데이터 길이
export const PACKET_PAYLOAD_LENGTH = 4; //페이로드 데이터 길이

export const PACKET_TYPE = {
  PING: 0,
  NORMAL: 1,
  GAME_START: 2,
  LOCATION: 3,
};
