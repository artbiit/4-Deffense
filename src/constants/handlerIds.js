export const RESPONSE_SUCCESS_CODE = 0;

const GlobalFailCode = Object.freeze({
  NONE: RESPONSE_SUCCESS_CODE,
  UNKNOWN_ERROR: 1,
  INVALID_REQUEST: 2,
  AUTHENTICATION_FAILED: 3,
});

export { GlobalFailCode };
