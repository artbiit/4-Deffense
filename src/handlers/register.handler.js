import logger from '../utils/logger.js';
import { mysql } from '../db/mysql.js';

/**
 * - 회원가입 요청(request) 함수
 *
 * 클라이언트에서 받은 회원가입 정보를 MySQL에 등록해주는 함수.
 *
 * @param {string} param.payload.id - 유저의 ID
 * @param {string} param.payload.password - 유저의 비밀번호
 * @param {string} param.payload.email - 유저의 이메일
 * @returns {void} 별도의 반환 값은 없으며, 성공 여부와 메시지를 클라이언트에게 전송.
 */
export const registerRequestHandler = async ({ socket, payload }) => {
  const { id, password, email } = payload;
  logger.info(`회원 가입 시도 ID: ${id}`);
  logger.info(`회원 가입 시도 비밀번호: ${password}`);
  logger.info(`회원 가입 시도 email: ${email}`);

  try {
    // 현재 회원가입 하려는 유저가 데이터를 누락했는지에 대한 유효성 검사(email은 제외시켰음)
    // ※특이사항 - packetParser 필수 필드 누락 부분으로 인해 작동하지 않는 부분
    if (!id || !password) {
      throw new Error('유효하지 않은 Id 및 Password 입니다.');
    }

    // 회원 가입 시도시 받은 id를 이용해 MySQL에서 유저 정보 확인
    const [[existingUser]] = await mysql.query('SELECT id FROM accounts WHERE id = ?', [id]);

    // MySQL에서 확인된 유저 정보를 이용해 현재 회원가입 하려는 유저의 정보가 MySQL에 존재한다면 조건 만족
    if (existingUser) {
      throw new Error('이미 존재하는 유저입니다.');
    }

    // 현재 회원가입 하려는 유저의 정보가 MySQL에 존재하지 않았다면 아래에서 회원가입 진행
    const nowTime = new Date(); // 현재 시간을 MySQL 형식으로 변환
    const timeConversion = nowTime.toISOString().slice(0, 19).replace('T', ' '); // 'YYYY-MM-DD HH:MM:SS' 형식으로 변환
    const [result] = await mysql.execute(
      'INSERT INTO accounts (id, password, email, bestScore, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        id, // ID
        password, // 비밀번호
        email, // 이메일
        0, // 최고기록
        timeConversion, // 계정 생성 시간
        timeConversion, // 계정 업데이트 시간
      ],
    );

    // 방금 회원 가입된 유저의 MySQL Primary Key
    const seqNo = result.insertId;

    // success response
    socket.write(
      JSON.stringify({
        success: true,
        message: `회원가입 완료: seqNo-${seqNo}, ID-${id}`,
      }),
    );
    logger.info(`회원가입 완료: seqNo-${seqNo}, ID-${id}`);
  } catch (error) {
    logger.error(`registerRequestHandler Error: ${error.message}`);
    socket.write(JSON.stringify({ success: false, message: 'registerRequestHandler Error' }));
  }
};

/**
 * - 회원가입 응답(response) 함수
 *
 * 회원가입 요청(클라이언트) -> 회원가입 응답(서버)
 * -> 회원가입 결과 요청(서버) -> 회원가입 결과 응답(클라이언트)
 * -> 회원가입 결과 응답 로그 출력 요청(클라이언트) -> 회원가입 결과 응답 로그 출력 응답(서버), 이 과정 중 마지막 과정을 처리하는 함수.
 *
 * ※특이사항 - 패킷 명세에 있어서 넣긴했는데 클라이언트에서 키를 찾을 수 없다는 이유로 받지를 못함
 * packetParser 필수 필드 누락 부분에서 문제가 생긴건 아니지만 비슷한 케이스일수도 있다고 생각함
 *
 * @param {boolean} param.payload.success - 클라이언트로부터 받은 응답 성공 여부
 * @param {string} param.payload.message - 클라이언트로부터 받은 응답 메시지
 * @param {string} [param.payload.failCode] - 클라이언트로부터 받은 실패 코드 (실패한 경우에만 존재)
 * @returns {void} 별도의 반환 값은 없으며, 성공 여부와 메시지를 클라이언트에게 전송.
 */
export const registerResponseHandler = async ({ socket, payload }) => {
  const { success, message, failCode } = payload;

  try {
    // 클라로부터 받은 응답을 확인하고 그에 따라 로그를 출력
    if (success) {
      // 응답이 성공적일 경우 출력
      logger.info(`회원가입 성공: ${message}`);
    } else {
      // 응답에 error가 존재할 경우 메시지를 클라이언트의 실패 코드와 함께 출력
      logger.warn(`회원가입 실패: ${message} (실패 코드: ${failCode})`);
    }

    // 클라이언트에게 회원가입 확인 응답을 다시 전송
    socket.write(
      JSON.stringify({
        success: true,
        message: '회원가입 응답 성공',
      }),
    );
  } catch (error) {
    logger.error(`registerResponseHandler Error: ${error.message}`);
    socket.write(JSON.stringify({ success: false, message: 'registerResponseHandler Error' }));
  }
};
