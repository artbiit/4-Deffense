import { RESPONSE_SUCCESS_CODE } from "../../constants/handlerIds.js";
import { getUserBySocket } from "../../session/user.session.js";
import CustomError from "../../utils/error/customError.js";
import { ErrorCodes } from "../../utils/error/errorCodes.js";
import { handleError } from "../../utils/error/errorHandler.js";
import { createResponse } from "../../utils/response/createResponse.js";

// 클라에서 대미지를 깎고 monsterId와 towerId를 담아서 보냄.
// 그럼 towerId로 tower를 찾아서 해당 타워의 공격력을 바탕으로
// monsterId로 찾아낸 monster의 체력을 서버에서도 계산을 한다.

// 클라에서의 대미지 공식
//  var result = dmg - data.def;
//  nowHp -= result;
const towerAttackRequestHandler = ({ socket, payload }) => {
  try {
    // 1. payload에 있는 monsterId 와 towerId를 빼낸다.
    const { monsterId, towerId } = payload;

    // 2. usersession에 socket으로 user를 찾는다. ( 질문 : tower와 monster는 유저에 넣을것인가 game에 넣을것인가?)
    // user에 넣었다면? 해당 하는 유저가 자기소유의 몬스터와 타워를 가지고 있다.
    // game에 넣었다면? 게임에서 참가중인 유저들을 들고 있고, 해당하는 유저를 찾아내서 사용 => 그럼 user가 들고있긴하겠네.
    // user에 그럼 tower와 monster를 배열로 들고있다고 생각하자.
    //
    const user = getUserBySocket(socket);

    // 찾은 유저가 없다. 에러
    if (!user) {
      throw new CustomError(
        ErrorCodes.USER_NOT_FOUND,
        "유저를 찾을 수 없습니다.by towerAttackRequestHandler"
      );
    }

    // 3. 찾아낸 user에 monsterId 와 towerId로 해당하는 타워와 몬스터를 찾아낸다.
    const monster = user.findMonster(monsterId);
    const tower = user.findTower(towerId);

    // 찾은 몬스터가 없다. 에러?
    if (!monster) {
      throw new CustomError(
        ErrorCodes.MISSING_FIELDS,
        "해당하는 몬스터를 찾을 수 없습니다.by towerAttackRequestHandler"
      );
    }
    // 찾은 타워가 없다. 에러?
    if (!tower) {
      throw new CustomError(
        ErrorCodes.MISSING_FIELDS,
        "해당하는 타워를 찾을 수 없습니다.by towerAttackRequestHandler"
      );
    }

    // 타워 공격력 - 몬스터 방어력
    // monster 클래스 내부에서 damage 입으면 방어력 빼는 계산을 할 것.
    monster.damage(tower.getPower());

    // 여기까지 타워가 몬스터에게 대미지를 입힌다. 까지 완료
    // 추후에 할것 있나?
    // 질문: HANDLER_IDS는 추가하지 않아도 되는것?
    const towerAttackResponse = createResponse(
      RESPONSE_SUCCESS_CODE,
      user,
      { message: `타워가 몬스터에게 성공적으로 공격했습니다.` },
    );
    socket.write(towerAttackResponse);
  } catch (error) {
    handleError(error);
  }
};

export default towerAttackRequestHandler;

// 필요한것. monster, tower 객체
