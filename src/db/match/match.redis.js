import { getRedis } from "../redis.js";
import CustomError from "../../utils/error/customError.js";
import configs from "../../configs/configs.js";
import logger from "../../utils/logger.js";

const { GlobalFailCode } = configs;

//*매치메이킹 대기열 키*/
const WAITING_KEY = "match_queue";
//** 매치메이킹 점수 정렬 키 */
const MATCH_SCORE_KEY = "match_scores";

//**매치메이킹 등록 함수 */
export const enqueueMatchMaking = async (userId, bestScore) => {
  try {
    if (!userId) {
      throw new Error("userId must be defined");
    }

    if (!bestScore || Number.isNaN(bestScore)) {
      throw new Error(
        `bestScore must be defined : ${bestScore}[${typeof bestScore}]`
      );
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

export const dequeueMatchMaking = async () => {
  try {
    const redis = await getRedis();

    const userId = await redis;
  } catch (error) {}
};
