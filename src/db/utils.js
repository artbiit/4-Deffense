import camelCase from 'lodash/camelCase.js';

export const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    // 배열인 경우, 배열의 각 요소에 대해 재귀적으로 toCamelCase 함수를 호출
    return obj.map((v) => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    // 객체인 경우, 객체의 키를 카멜케이스로 변환하고, 값에 대해서도 재귀적으로 toCamelCase 함수를 호출
    return Object.keys(obj).reduce((result, key) => {
      result[camelCase(key)] = toCamelCase(obj[key]);
      return result;
    }, {});
  }
  // 객체도 배열도 아닌 경우, 원본 값을 반환
  return obj;
};

/**
 * - 시간을 초 단위로 변환 해주는 함수
 *
 * 매개 변수(time)로 받은 시간을 초 단위로 변환 해주는 함수.
 *
 * @param {string} time - 시간
 * @returns {number} 초 단위의 시간
 */
export const timeConversion = (time) => {
  // 마지막 문자(시간 단위 부분) 추출
  const timeString = time.slice(-1);
  // 시간 문자열을 정수로 변환
  const timeNumber = parseInt(time.slice(0, -1), 10);

  // 시간 단위에 따라 시간 정수를 초 단위의 시간으로 변환
  switch (timeString) {
    case 'd': // 일 단위
      return timeNumber * 86400;
    case 'h': // 시간 단위
      return timeNumber * 3600;
    case 'm': // 분 단위
      return timeNumber * 60;
    default: // 초 단위
      return timeNumber;
  }
};
