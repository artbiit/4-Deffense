// 서버 초기화 작업
import { getProtoMessages, loadProtos } from './loadProtos.js';
import { mysql } from '../db/mysql.js';
import logger from '../utils/logger.js';
import { connect } from '../db/redis.js';
import { loadGameAssets } from './loadAssets.js';
const initServer = async () => {
  try {
    await Promise.all([loadGameAssets(), loadProtos(), mysql.init(), connect()]);
    logger.info('All initialized.');
    // 다음 작업
  } catch (e) {
    logger.error(e);
    process.exit(1); // 오류 발생 시 프로세스 종료
  }
};

export default initServer;

// await initServer();
// process.exit(1);
