import configs from '../../configs/configs.js';
import logger from '../../utils/logger.js';
import { getRedis, getSubscriberRedis } from '../../db/redis.js';
import {
  dequeueMatchMaking,
  getQueueCount,
  GetUsersByScoreRange,
  getUserScore,
  removeUsers,
} from '../../db/match/match.redis.js';
import { getUserById } from '../../session/user.session.js';
import { addGameSession } from '../../session/game.session.js';

const { REDIS_MATCH_REQUEST_CHANNEL } = configs;

class MatchMaker {
  constructor() {}

  async init() {
    const redis = await getSubscriberRedis();
    await redis.subscribe(REDIS_MATCH_REQUEST_CHANNEL);
    redis.on('message', async (channel, message) => {
      if (channel === REDIS_MATCH_REQUEST_CHANNEL) {
        await this.#matchMaking();
      }
    });
    logger.info('MatchMaker initialized');
  }

  #matchMaking = async () => {
    let queueCount = await getQueueCount();
    console.log(queueCount);
    //1명이면 매칭이 불가능함
    if (queueCount < 2) {
      return;
    }
    //유저 정보 없으면 쿼리 중에 소거된 것이니 작업 취소
    const userByQueue = await dequeueMatchMaking();
    console.log(userByQueue);
    if (!userByQueue) {
      return;
    }

    try {
      let range = 50;
      let tryCount = 0;
      while (true) {
        console.log(`match Try : ${tryCount}`);
        const user = getUserById(userByQueue.userId);

        //연결이 해제 되었으면 작업 취소
        if (!user) {
          break;
        }

        let userScore = await getUserScore(userByQueue.userId);
        console.log('userScore:', userScore);
        //연결해제든, 이미 다른 곳에서 매칭된 것이든 작업 취소
        if (!userScore) {
          break;
        }
        userScore = Number(userScore);
        const rangeUsers = await GetUsersByScoreRange(userScore - range, userScore + range, 5);
        console.log('-------------------\n', rangeUsers);
        console.log('-----------------------');
        if (rangeUsers) {
          let closestUser = null;
          let minSocreDiff = Infinity;
          for (let i = 0; i < rangeUsers.length; i += 2) {
            const rUserId = rangeUsers[i];
            const rUser = getUserById(rUserId);
            if (!rUserId || rUserId === userByQueue.userId || !rUser) {
              continue;
            }
            const rScore = Number(rangeUsers[i + 1]);
            const scoreDiff = Math.abs(userScore - rScore);

            if (scoreDiff < minSocreDiff) {
              console.log(`${user.id}/${user.bestScore} - ${rUser.id}/${rUser.bestScore}`);
              minSocreDiff = scoreDiff;
              closestUser = rUser;
            }
          }

          if (closestUser) {
            console.log('removeUsers');
            //매칭
            await removeUsers(userByQueue.userId, closestUser.id);
            console.log('removeUsers end');
            //게임에 유저 등록
            const gameSession = await addGameSession();
            gameSession.addUser(user);
            gameSession.addUser(closestUser);
          }
        }
        //점진적 범위 증가
        range = 50 + tryCount++ * tryCount * 100;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        queueCount = await getQueueCount();
        if (queueCount < 2) {
          logger.info(`MatchMaker. Stop : ${queueCount}`);
          break;
        }
      }
    } catch (error) {
      logger.error(`MatchMaker. ${error}`);
    }
  };
}

const matchMaker = new MatchMaker();
export default matchMaker;
