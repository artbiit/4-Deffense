# 적타워설치 알림을 보낼때 상대방 유저 객체에 접근하지 못하는 오류 수정

## 오류 발견

```
[ERROR]: [8]일반 에러: TypeError: user?.getNextSequence is not a function
```

- C2S타워구매요청 패킷을 처리하던 중 해당 오류가 발생

## 해결 과정

- getNextSequence를 호출하는데 실패한 코드가 makeNotification.js인것을 파악
  getNextSequence가 User 클래스의 메서드이기 때문에 makeNotification이 인자로 받은 user가 User 객체가 아닐것이라 의심했고, 출력해본 결과 user가 undefined인 것을 확인

`const opponent = gameSession.getOpponent(user.id);`

- 되짚어나가본 결과 타워구매 핸들러 내 적타워설치 알림을 처리하는 코드에서 `opponent`가 비어있는 것을 확인

## 원인

- 게임세션에 참가한 유저목록의 자료구조 바뀐것을 캐치하지 못하고 오래된 방식으로 접근하던 것이 문제의 원인

## 해결

`const opponent = gameSession.getOpponent(user.id).user;`

- 코드를 위와 같이 수정하니 오류가 사라짐
