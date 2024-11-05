import Result from "../../handlers/result.js";
import logger from "../logger.js";
import configs from "../../configs/configs.js";

const { GlobalFailCode } = configs;

export const handleError = (error) => {
  let responseType;
  let message;
  if (error.code) {
    responseType = error.code;
    message = error.message;
    logger.error(`에러 코드: ${error.code}, 메시지: ${error.message}`);
  } else {
    responseType = GlobalFailCode.UNKNOWN_ERROR;
    message = error.message;
    logger.error(`일반 에러: ${error.message}`);
  }

  return new Result({ message });
};
