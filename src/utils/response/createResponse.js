import { getProtoMessages } from "../../init/loadProtos.js";
import configs from "../../configs/configs.js";
import { getProtoTypeNameByHandlerId } from "../../handlers/index.js";

const {
  PACKET_TYPE_LENGTH,
  PACKET_VERSION_LENGTH,
  PACKET_SEQUENCE_LENGTH,
  PACKET_PAYLOAD_LENGTH,
  CLIENT_VERSIONS,
} = configs;

export const createResponse = (responseType, user, data = {}) => {
  const packetTypeBuffer = Buffer.alloc(PACKET_TYPE_LENGTH);
  packetTypeBuffer.writeUintBE(responseType, 0, PACKET_TYPE_LENGTH);

  const version = CLIENT_VERSIONS[0];

  const versionBuffer = Buffer.from(version);

  const versionLengthBuffer = Buffer.alloc(PACKET_VERSION_LENGTH);
  versionLengthBuffer.writeUintBE(
    versionBuffer.length,
    0,
    PACKET_VERSION_LENGTH
  );

  const sequenceBuffer = Buffer.alloc(PACKET_SEQUENCE_LENGTH);
  sequenceBuffer.writeUintBE(
    user?.getNextSequence() || 0,
    0,
    PACKET_SEQUENCE_LENGTH
  );

  const protoMessages = getProtoMessages();
  const payloadMessage =
    protoMessages[getProtoTypeNameByHandlerId(responseType)];

  const payloadBuffer = payloadMessage.encode(data).finish();

  const payloadLengthBuffer = Buffer.alloc(PACKET_PAYLOAD_LENGTH);
  payloadLengthBuffer.writeUintBE(
    payloadBuffer.length,
    0,
    PACKET_PAYLOAD_LENGTH
  );

  // 길이 정보와 메시지를 함께 전송
  return Buffer.concat([
    packetTypeBuffer,
    versionLengthBuffer,
    versionBuffer,
    sequenceBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);
};
