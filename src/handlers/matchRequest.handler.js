import { enqueueMatchMaking } from '../db/match/match.redis.js';
import { getUserBySocket } from '../session/user.session.js';

/**
 * 별도의 응답은 없고, 매칭 등록만 합니다.
 */
export const matchRequestHandler = async ({ socket, payload }) => {
  const user = getUserBySocket(socket);
  await enqueueMatchMaking(user.id, user.bestScore);
};
