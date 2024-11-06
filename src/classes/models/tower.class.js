import { v4 as uuidv4 } from 'uuid';

class Tower {
  /**
   * @param {{x: Number, y: Number}} coord 설치할 좌표
   */
  constructor(coords) {
    this.id = uuidv4();

    this.x = coords.x;
    this.y = coords.y;
  }
}
export default Tower;
