import Client from './client.test.js';
import { getOrCreateClient } from './client.test.js';
import configs from '../configs/configs.js';

const { PacketType } = configs;

const client = getOrCreateClient('localhost', 5555);
await client.connect();

client.sendMessage(PacketType.TOWER_ATTACK_REQUEST, {
  monsterId: '몬스터아이디',
  towerId: '타워아이디',
});

client.addHandler(PacketType.TOWER_ATTACK_REQUEST, async (payload) => {
  // console.log(payload);
});
