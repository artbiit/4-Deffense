import Client from './client.test.js';
import configs from '../configs/configs.js';

const { PacketType } = configs;

const client = new Client('localhost', 5555);
await client.connect();

client.sendMessage(PacketType.REGISTER_REQUEST, {
  id: '나좀그만괴롭혀',
  password: '박용현죽어라',
  email: '문민철@게으름',
});
