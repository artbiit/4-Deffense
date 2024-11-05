import { ReversePacketType } from "../constants/header.js";

class Result {
  constructor(payload, responseType) {
    if (
      typeof payload !== "object" ||
      payload === null ||
      Array.isArray(payload)
    ) {
      throw new Error("payload must be an object");
    }

    if (!ReversePacketType[responseType]) {
      throw new Error(`responseType is unknown : ${responseType}`);
    }

    this.responseType = responseType;
    this.payload = payload;
  }
}

export default Result;
