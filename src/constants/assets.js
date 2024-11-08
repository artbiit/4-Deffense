export const ASSET_TYPE = Object.freeze({
  BASE: 0,
  MONSTER: 1,
  TOWER: 2,
});

/**
 * key: ASSET_TYPE
 *
 * value: STRING
 */
export const ASSET_ID_PREFIX = Object.freeze({
  1: 'MON', // ASSET_TYPE.MONSTER
  2: 'TOW', // ASSET_TYPE.TOWER
});
