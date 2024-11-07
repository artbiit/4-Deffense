/**
 * message S2CMatchStartNotification {
    InitialGameState initialGameState = 1;
    GameState playerData = 2;
    GameState opponentData = 3;
}
    
message InitialGameState {
  int32 baseHp = 1;
  int32 towerCost = 2;
  int32 initialGold = 3;
  int32 monsterSpawnInterval = 4;
}

message GameState {
  int32 gold = 1;
  BaseData base = 2;
  int32 highScore = 3;
  repeated TowerData towers = 4;
  repeated MonsterData monsters = 5;
  int32 monsterLevel = 6;
  int32 score = 7;
  repeated Position monsterPath = 8;
  Position basePosition = 9;
}
  
 * 
 */
export const createMatchNotification = async (gameSesion) => {};
