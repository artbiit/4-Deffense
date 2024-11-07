import logger from '../utils/logger.js';
import { mysql } from '../db/mysql.js';
import { getRedis } from '../db/redis.js';
import jwt from 'jsonwebtoken';
import configs from '../configs/configs.js';
import { GlobalFailCode } from '../constants/handlerIds.js';
import { cacheUserToken, findUserByIdPw } from '../db/user/user.db.js';
import Result from './result.js';

// 환경 변수에서 JWT 설정 불러오기
const { JWT_SECRET, JWT_EXPIRES_IN, JWT_ALGORITHM, JWT_ISSUER, JWT_AUDIENCE, PacketType } = configs;

/**
 * - 로그인 요청(request) 함수
 *
 * 클라이언트에서 받은 로그인 정보를 통해 사용자를 인증(대소문자 구분)하고, 성공 시 JWT 토큰을 발급해주는 함수.
 *
 * @param {string} param.payload.id - 유저의 ID
 * @param {string} param.payload.password - 유저의 비밀번호
 * @returns {void} 별도의 반환 값은 없으며, 성공 여부와 메시지를 클라이언트에게 전송.
 */
export const loginRequestHandler = async ({ socket, payload }) => {
  const { id, password } = payload;

  let failCode = GlobalFailCode.NONE;
  let message = undefined;
  let success = true;
  let token = '';
  try {
    const userByDB = await findUserByIdPw(id, password);

    if (userByDB) {
      token = jwt.sign({ userId: id, seqNo: userByDB.seqNo }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: JWT_ALGORITHM,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });

      await cacheUserToken(userByDB.seqNo, token);
      message = '로그인에 성공 했습니다.';
      logger.info(`로그인 성공 : ${userByDB.seqNo}`);
    } else {
      success = false;
      failCode = GlobalFailCode.AUTHENTICATION_FAILED;
      message = '아이디 혹은 비밀번호를 확인해주세요.';
    }
  } catch (error) {
    logger.error(`loginRequestHandler Error: ${error.message}`);
    success = false;
    failCode = GlobalFailCode.UNKNOWN_ERROR;
    message = '로그인 과정 중 문제가 발생했습니다.';
  }

  return new Result({ success, message, token, failCode }, PacketType.LOGIN_RESPONSE);
};
