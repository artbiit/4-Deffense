import { getRedis } from '../redis.js';
import CustomError from '../../utils/error/customError.js';
import configs from '../../configs/configs.js';
import logger from '../../utils/logger.js';

const { GlobalFailCode } = configs;

/**매치메이킹 대기열 키*/
const WAITING_KEY = 'match_queue';
/** 매치메이킹 점수 정렬 키 */
const MATCH_SCORE_KEY = 'match_scores';

/**매치메이킹 등록 함수 */
export const enqueueMatchMaking = async (userId, bestScore) => {
  try {
    if (!userId) {
      throw new Error('userId must be defined');
    }

    if (!bestScore || Number.isNaN(bestScore)) {
      throw new Error(`bestScore must be defined : ${bestScore}[${typeof bestScore}]`);
    }
    const redis = await getRedis();

    const multi = redis.multi();

    multi.rpush(WAITING_KEY, userId);
    multi.zadd(MATCH_SCORE_KEY, bestScore, userId);

    multi.exec();
  } catch (error) {
    logger.error(`enqueueMatchMaking. ${error.message}`);
    throw error;
  }
};

/** 대기열에 등록된 유저 정보 */
export const dequeueMatchMaking = async () => {
  try {
    const redis = await getRedis();

    const userId = await redis.lPop(WAITING_KEY);
    if (!userId) {
      logger.warn('dequeueMatchMaking. lPop is empty');
      return null;
    }

    const userScore = await redis.zScore(MATCH_SCORE_KEY, userId);

    if (!userScore) {
      logger.warn(`dequeueMatchMaking. could not found Score : ${userId}`);
      return null;
    }

    return { userId, userScore };
  } catch (error) {
    logger.error(`dequeueMatchMaking. ${error.message}`);
    throw error;
  }
};

/** 대기열 인원 수 반환 */
export const getQueueCount = async () => {
  try {
    const redis = await getRedis();
    const queueLength = await redis.lLen(WAITING_KEY);
    return queueLength;
  } catch (error) {
    logger.error(`getQueueCount. ${error.message}`);
    throw error;
  }
};

/** 해당 유저 정보 제거 */
export const removeUserScore = async (userId) => {
  try {
    const redis = await getRedis();
    const removedCount = await redis.zRem(MATCH_SCORE_KEY, userId);
    return removedCount;
  } catch (error) {
    logger.error(`removeUserScore. ${error.message}`);
    throw error;
  }
};
