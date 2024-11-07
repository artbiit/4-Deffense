import logger from '../utils/logger.js';
import { mysql } from '../db/mysql.js';
import { getRedis } from '../db/redis.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

// 환경 변수에서 JWT 설정 불러오기
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_ALGORITHM,
  JWT_ISSUER,
  JWT_AUDIENCE,
} = process.env;

/**
 * - 시간을 초 단위로 변환 해주는 함수
 *
 * 매개 변수(time)로 받은 시간을 초 단위로 변환 해주는 함수.
 *
 * @param {string} time - 시간
 * @returns {number} 초 단위의 시간
 */
function timeConversion(time) {
  // 마지막 문자(시간 단위 부분) 추출
  const timeString = time.slice(-1);
  // 시간 문자열을 정수로 변환
  const timeNumber = parseInt(time.slice(0, -1), 10);

  // 시간 단위에 따라 시간 정수를 초 단위의 시간으로 변환
  switch (timeString) {
    case 'd': // 일 단위
      return timeNumber * 86400;
    case 'h': // 시간 단위
      return timeNumber * 3600;
    case 'm': // 분 단위
      return timeNumber * 60;
    default: // 초 단위
      return timeNumber;
  }
}

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
  logger.info(`로그인 시도 ID: ${id}`);
  logger.info(`로그인 시도 비밀번호: ${password}`);

  try {
    // 현재 로그인 하려는 유저가 데이터를 누락했는지에 대한 유효성 검사
    // ※특이사항 - packetParser 필수 필드 누락 부분으로 인해 작동하지 않는 부분
    if (!id || !password) {
      throw new Error('유효하지 않은 ID 또는 비밀번호입니다.');
    }

    // 로그인 시도시 받은 id를 이용해 MySQL에서 유저 정보 확인
    const [[existingUser]] = await mysql.query('SELECT id, password FROM accounts WHERE id = ?', [
      id,
    ]);

    // MySQL에서 확인된 유저 정보를 이용해 현재 로그인 하려는 유저의 정보가 MySQL에 존재하지 않는다면 조건 만족
    if (!existingUser) {
      throw new Error('존재하지 않는 유저입니다.');
    }
    // MySQL에서 확인된 유저 정보를 이용해 현재 로그인 하려는 유저의 정보가 MySQL에 존재한다면
    // MySQL에서 가져온 유저의 password와 로그인 시도시 받은 password가 같지 않을 경우 조건 만족
    else if (existingUser.password !== password) {
      throw new Error('비밀번호가 틀렸습니다.');
    }

    // 액세스 토큰 생성
    const accessToken = jwt.sign({ userId: existingUser.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: JWT_ALGORITHM,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    // 리프레시 토큰 생성
    const refreshToken = jwt.sign({ userId: existingUser.id }, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      algorithm: JWT_ALGORITHM,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    // Redis에 액세스 토큰과 리프레시 토큰 캐싱
    const redis = await getRedis();
    await redis.set(
      `user:${existingUser.id}:accessToken`,
      accessToken,
      'EX',
      timeConversion(JWT_EXPIRES_IN) + 60,
    );
    await redis.set(
      `user:${existingUser.id}:refreshToken`,
      refreshToken,
      'EX',
      timeConversion(JWT_REFRESH_EXPIRES_IN) + 60,
    );

    // 로그인 성공 응답
    socket.write(
      JSON.stringify({
        success: true,
        message: `로그인 성공 ID: ${id}`,
        accessToken,
        refreshToken,
      }),
    );
    logger.info(`로그인 성공 ID: ${id}`);
  } catch (error) {
    logger.error(`loginRequestHandler Error: ${error.message}`);
    socket.write(JSON.stringify({ success: false, message: 'loginRequestHandler Error' }));
  }
};

/**
 * - 로그인 응답(response) 함수
 *
 * 로그인 요청(클라이언트) -> 로그인 응답(서버)
 * -> 로그인 결과 요청(서버) -> 로그인 결과 응답(클라이언트)
 * -> 로그인 결과 응답 로그 출력 요청(클라이언트) -> 로그인 결과 응답 로그 출력 응답(서버), 이 과정 중 마지막 과정을 처리하는 함수.
 *
 * ※특이사항 - 패킷 명세에 있어서 넣긴했는데 클라이언트에서 키를 찾을 수 없다는 이유로 받지를 못함
 * packetParser 필수 필드 누락 부분에서 문제가 생긴건 아니지만 비슷한 케이스일수도 있다고 생각함
 *
 * @param {boolean} param.payload.success - 클라이언트로부터 받은 응답 성공 여부
 * @param {string} param.payload.message - 클라이언트로부터 받은 응답 메시지
 * @param {string} [param.payload.token] - 클라이언트로부터 받은 JWT 토큰 (로그인 성공 시에만 존재)
 * @param {string} [param.payload.failCode] - 클라이언트로부터 받은 실패 코드 (실패한 경우에만 존재)
 * @returns {void} 별도의 반환 값은 없으며, 성공 여부와 메시지를 클라이언트에게 전송.
 */
export const loginResponseHandler = async ({ socket, payload }) => {
  const { success, message, token, failCode } = payload;

  try {
    // 클라로부터 받은 응답을 확인하고 그에 따라 로그를 출력
    if (success) {
      // 응답이 성공적일 경우 메시지와 토큰을 출력
      logger.info(`로그인 성공: ${message}`);
      logger.info(`발급된 토큰: ${token}`);
    } else {
      // 응답에 error가 존재할 경우 메시지를 클라이언트의 실패 코드와 함께 출력
      logger.warn(`로그인 실패: ${message} (실패 코드: ${failCode})`);
    }

    // 클라이언트에게 회원가입 확인 응답을 다시 전송
    socket.write(
      JSON.stringify({
        success: true,
        message: '회원가입 응답 성공',
      }),
    );
  } catch (error) {
    logger.error(`loginResponseHandler Error: ${error.message}`);
    socket.write(JSON.stringify({ success: false, message: 'loginResponseHandler Error' }));
  }
};
