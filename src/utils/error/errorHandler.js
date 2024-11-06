import Result from '../../handlers/result.js';
import logger from '../logger.js';
import configs from '../../configs/configs.js';
import CustomError from './customError.js';

const { GlobalFailCode } = configs;

/**
 *  CustomError 객체를 전달하지 않을시 클라이언트로 데이터를 반환하지 않습니다.
 */
export const handleError = (packetType, error) => {
  let responseType;
  let message;

  if (error.code) {
    responseType = error.code;
    message = error.message;
    logger.error(`[${packetType}]에러 코드: ${error.code}, 메시지: ${error.message}`);
    return new Result({ message }, responseType);
  } else {
    responseType = GlobalFailCode.UNKNOWN_ERROR;
    message = error.message;
    logger.error(`[${packetType}]일반 에러: ${error}`);
  }
};
