class Result {
  constructor(payload) {
    if (
      typeof payload !== "object" ||
      payload === null ||
      Array.isArray(payload)
    ) {
      throw new Error("payload must be an object");
    }

    this.payload = payload;
  }
}

export default Result;
