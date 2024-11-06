import configs from '../configs/configs.js';
import { getHandlerById } from '../handlers/index.js';
import { getUserBySocket } from '../session/user.session.js';
import { handleError } from '../utils/error/errorHandler.js';
import { packetParser } from '../utils/parser/packetParser.js';
import { createResponse } from '../utils/response/createResponse.js';

const {
  PACKET_TYPE_LENGTH,
  PACKET_TOTAL_LENGTH,
  PACKET_VERSION_LENGTH,
  PACKET_SEQUENCE_LENGTH,
  PACKET_PAYLOAD_LENGTH,
} = configs;

export const onData = (socket) => async (data) => {
  socket.buffer = Buffer.concat([socket.buffer, data]);

  while (socket.buffer.length >= PACKET_TOTAL_LENGTH) {
    const packetType = socket.buffer.readUintBE(0, PACKET_TYPE_LENGTH);
    const versionLength = socket.buffer.readUintBE(PACKET_TYPE_LENGTH, PACKET_VERSION_LENGTH);
    let offset = PACKET_TYPE_LENGTH + PACKET_VERSION_LENGTH;
    const version = socket.buffer.subarray(offset, offset + versionLength).toString();
    offset += versionLength;
    const sequence = socket.buffer.readUintBE(offset, PACKET_SEQUENCE_LENGTH);
    offset += PACKET_SEQUENCE_LENGTH;
    const payloadLength = socket.buffer.readUintBE(offset, PACKET_PAYLOAD_LENGTH);
    offset += PACKET_PAYLOAD_LENGTH;

    const requiredLength = offset + payloadLength;

    if (socket.buffer.length >= requiredLength) {
      const payloadData = socket.buffer.subarray(offset, requiredLength);
      socket.buffer = socket.buffer.subarray(requiredLength);

      let result = null;
      try {
        const payload = packetParser(socket, packetType, version, sequence, payloadData);
        const handler = getHandlerById(packetType);
        result = await handler({ socket, payload });
      } catch (error) {
        console.log(error);
        result = handleError(packetType, error);
      } finally {
        if (result) {
          const response = createResponse(
            result.responseType,
            getUserBySocket(socket),
            result.payload,
          );
          socket.write(response);
        }
      }
    } else {
      break;
    }
  }
};
