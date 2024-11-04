import { getProtoMessages } from "../../init/loadProtos.js";
import { getProtoTypeNameByHandlerId } from "../../handlers/index.js";
import CustomError from "../error/customError.js";
import logger from "../logger.js";
import configs from "../../configs/configs.js";
import { getUserBySocket } from "../../session/user.session.js";

const { GlobalFailCode, CLIENT_VERSIONS } = configs;

export const packetParser = (
  socket,
  packetType,
  version,
  sequence,
  payloadBuffer
) => {
  //버전 호환 필터
  if (!CLIENT_VERSIONS.includes(version)) {
    throw new CustomError(GlobalFailCode.INVALID_REQUEST, "VERSION_MISMATCH");
  }

  const user = getUserBySocket(socket);
  if (user && user.sequence !== sequence) {
    throw new CustomError(GlobalFailCode.INVALID_REQUEST, "INVALID_SEQUENCE");
  }

  const protoMessages = getProtoMessages();
  // 핸들러 ID에 따라 적절한 payload 구조를 디코딩
  const gamePacket = protoMessages.GamePacket;
  let decodedGamePacket = null;
  try {
    decodedGamePacket = gamePacket.decode(payloadBuffer);
  } catch (error) {
    logger.error(error);
    throw new CustomError(
      GlobalFailCode.INVALID_REQUEST,
      `패킷 디코딩 중 문제 발생 : GamePacket`
    );
  }

  // 핸들러 ID에 따라 적절한 payload 구조를 디코딩
  const { namespace, typeName } = getProtoTypeNameByHandlerId(packetType);
  const PayloadType = protoMessages[namespace][typeName];
  let payload;
  try {
    payload = PayloadType.decode(decodedGamePacket.payload);
  } catch (error) {
    logger.error(error);
    throw new CustomError(
      GlobalFailCode.INVALID_REQUEST,
      "패킷 구조가 일치하지 않습니다."
    );
  }

  // 필드가 비어 있거나, 필수 필드가 누락된 경우 처리
  const expectedFields = Object.keys(PayloadType.fields);
  const actualFields = Object.keys(payload);
  const missingFields = expectedFields.filter(
    (field) => !actualFields.includes(field)
  );
  if (missingFields.length > 0) {
    throw new CustomError(
      GlobalFailCode.INVALID_REQUEST,
      `필수 필드가 누락되었습니다: ${missingFields.join(", ")}`
    );
  }

  return payload;
};
