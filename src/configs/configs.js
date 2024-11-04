import { RESPONSE_SUCCESS_CODE, HANDLER_IDS } from "../constants/handlerIds.js";
import {
  PACKET_HEADER_LENGTH,
  PACKET_TYPE_LENGTH,
  PACKET_TYPE,
} from "../constants/header.js";
import { CLIENT_VERSIONS } from "../constants/constants.js";
import env from "../constants/env.js";

const configs = {
  RESPONSE_SUCCESS_CODE,
  HANDLER_IDS,
  CLIENT_VERSIONS,
  PACKET_HEADER_LENGTH,
  PACKET_TYPE_LENGTH,
  PACKET_TOTAL_LENGTH: PACKET_HEADER_LENGTH + PACKET_TYPE_LENGTH,
  PACKET_TYPE,
  ...env,
};

export default configs;
