import Result from "../../handlers/result.js";
import logger from "../logger.js";
import { ErrorCodes } from "./errorCodes.js";

export const handleError = (handlerId, error) => {
  let responseCode;
  let message;
  if (error.code) {
    responseCode = error.code;
    message = error.message;
    logger.error(`에러 코드: ${error.code}, 메시지: ${error.message}`);
  } else {
    responseCode = ErrorCodes.SOCKET_ERROR;
    message = error.message;
    logger.error(`일반 에러: ${error.message}`);
  }

  return new Result(responseCode, { message });
};
