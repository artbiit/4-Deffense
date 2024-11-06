import { RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { getUserBySocket } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { createResponse } from '../../utils/response/createResponse.js';
import { getGameAssets } from '../../init/loadAssets.js';

// 클라에서 대미지를 깎고 monsterId와 towerId를 담아서 보냄.
// 그럼 towerId로 tower를 찾아서 해당 타워의 공격력을 바탕으로
// monsterId로 찾아낸 monster의 체력을 서버에서도 계산을 한다.

// 클라에서의 대미지 공식
//  var result = dmg - data.def;
//  nowHp -= result;
export const towerAttackRequestHandler = ({ socket, payload }) => {
  try {
    // 1. payload에 있는 monsterId 와 towerId를 빼낸다.
    const { monsterId, towerId } = payload;

    // 2. usersession에 socket으로 user를 찾는다.
    const user = getUserBySocket(socket);
    if (!user) {
      throw new CustomError(
        ErrorCodes.USER_NOT_FOUND,
        '유저를 찾을 수 없습니다.by towerAttackRequestHandler',
      );
    }
    const userId = user.id;

    // 3. 유저로 게임을 찾는다
    const game = getGameSessionByUserId(userId);
    if (!game) {
      throw new CustomError(
        ErrorCodes.GAME_NOT_FOUND,
        '게임을 찾을 수 없습니다. by towerAttackRequestHandler',
      );
    }

    // 4. 찾아낸 userId, monsterId 와 towerId로 해당하는 타워와 몬스터를 찾아낸다.
    const monster = game.getMonster(userId, monsterId);
    const tower = game.getTower(userId, towerId);

    // 찾은 몬스터가 없다. 에러?
    if (!monster) {
      throw new CustomError(
        ErrorCodes.MISSING_FIELDS,
        '해당하는 몬스터를 찾을 수 없습니다.by towerAttackRequestHandler',
      );
    }
    // 찾은 타워가 없다. 에러?
    if (!tower) {
      throw new CustomError(
        ErrorCodes.MISSING_FIELDS,
        '해당하는 타워를 찾을 수 없습니다.by towerAttackRequestHandler',
      );
    }

    // 타워 공격력 - 몬스터 방어력
    // monster 클래스 내부에서 damage 입으면 방어력 빼는 계산을 할 것.

    // 대미지 맞는지 검증?
    // 클라에서 대미지가 넘어오는게 아니라 id로 넘어오는데 대미지 검증이 의미가 있나?
    const { monsters, towers } = getGameAssets();
    const monsterDef = monsters.data.find((mon) => mon.id === monster.id).def;
    const towerPower = towers.data.find((tow) => tow.id === tower.id).Power;
    const guessDamage = towerPower - monsterDef;
    const realDamage = tower.getPower() - monster.getDef();

    if (guessDamage !== realDamage) {
      throw new CustomError(
        ErrorCodes.MISSING_FIELDS,
        '대미지 계산이 서로 다릅니다.by towerAttackRequestHandler',
      );
    }

    monster.damage(realDamage);

    // 여기까지 타워가 몬스터에게 대미지를 입힌다. 까지 완료
    // 추후에 할것 있나?
    // 질문: HANDLER_IDS는 추가하지 않아도 되는것?
    const towerAttackResponse = createResponse(RESPONSE_SUCCESS_CODE, user, {
      message: `타워가 몬스터에게 성공적으로 공격했습니다.`,
    });
    socket.write(towerAttackResponse);
  } catch (error) {
    handleError(error);
  }
};

// 클라에 보니깐 base 객체가 따로 없다.
// 클라의 GameManager에 homehp로 표현되어있고, 클라의 몬스터 attack에 직접적으로 base의 체력을 깎는 코드는 없음.
// 몬스터가 base에 도달하면 대미지 주고 remove되고 있음. 하지만 remove될때 서버에 보내는건 없음.
export const monsterAttackBaseRequestHandler = ({ socket, payload }) => {
  try {
    // 1. payload에 있는 damage를 빼낸다.
    const { damage } = payload;

    // 2. usersession에 socket으로 user를 찾는다.
    const user = getUserBySocket(socket);
    if (!user) {
      throw new CustomError(
        ErrorCodes.USER_NOT_FOUND,
        '유저를 찾을 수 없습니다.by monsterAttackBaseRequestHandler',
      );
    }
    const userId = user.id;

    // 3. 유저로 게임을 찾는다
    const game = getGameSessionByUserId(userId);
    if (!game) {
      throw new CustomError(
        ErrorCodes.GAME_NOT_FOUND,
        '게임을 찾을 수 없습니다. by monsterAttackBaseRequestHandler',
      );
    }

    // userId와 damage로 base에 damage준다.
    game.baseDamage(userId, damage);

    // 여기까지 몬스터가 base에게 대미지를 주었다. 완료.
    // 추후에 할것 있나?
    const monsterAttackResponse = createResponse(RESPONSE_SUCCESS_CODE, user, {
      message: `몬스터가 베이스에게 성공적으로 공격했습니다.`,
    });
    socket.write(monsterAttackResponse);
  } catch (error) {
    handleError(error);
  }
};

// 필요한것. monster, tower 객체, getGameSessionByUser 함수,
// game.baseDamage, game.getMonster, game.getTower
// monsterId, towerId 는 각 몬스터 타워마다의 고유 Id
// 아니면 json 파일에 있는것처럼 몬스터 타워 넘버링인지?

// 일단은 고유 Id로 생각하고 작업한 상태 monsterId 와 monster.id가 다르다는 의미.
