import { RESPONSE_SUCCESS_CODE } from "../constants/handlerIds.js";
import {
  PACKET_TYPE_LENGTH,
  PACKET_PAYLOAD_LENGTH,
  PACKET_SEQUENCE_LENGTH,
  PACKET_VERSION_LENGTH,
  PACKET_TYPE,
} from "../constants/header.js";
import { CLIENT_VERSIONS } from "../constants/constants.js";
import env from "../constants/env.js";

const configs = {
  RESPONSE_SUCCESS_CODE,
  CLIENT_VERSIONS,
  PACKET_TYPE_LENGTH,
  PACKET_PAYLOAD_LENGTH,
  PACKET_SEQUENCE_LENGTH,
  PACKET_VERSION_LENGTH,
  PACKET_TOTAL_LENGTH:
    PACKET_TYPE_LENGTH +
    PACKET_PAYLOAD_LENGTH +
    PACKET_SEQUENCE_LENGTH +
    PACKET_VERSION_LENGTH,
  PACKET_TYPE,
  ...env,
};

export default configs;
