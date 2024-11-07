import logger from '../utils/logger.js';

/**
 * - 게임 종료 함수
 *
 * 게임 종료 패킷으로 호출 되는 함수인것 같지만 재철 튜터님 말씀으론 게임 종료 패킷은 안쓰이는 패킷이라고 합니다.
 * 그러므로 게임 종료 패킷을 이용한 핸들러는 구현하지 않았습니다.
 * 하지만 별도의 종료 로직은 서버에서 구현해야 한다고 하셨으며, 클라이언트의 종료 조건은 hp가 0일때 이라고 하셨으므로
 * Base 로직 담당인 봉준님과 상의 후 봉준님께서 구현한다고 하셨습니다.
 *
 * @param {string} param.payload - 내용 없음
 * @returns {void} 별도의 반환 값은 없다.
 */
export const gameEndRequestHandler = async ({ socket, payload }) => {
  logger.info(`gameEndRequestHandler logger`);
};
