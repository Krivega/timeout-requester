export default class SetTimeoutRequest {
  private requestIDInner?: NodeJS.Timeout;

  public get requested(): boolean {
    return !!this.requestID;
  }

  public get requestID() {
    return this.requestIDInner;
  }

  public set requestID(requestID) {
    this.requestIDInner = requestID;
  }

  public request(timeoutFunction: () => void, delay: number) {
    this.cancelRequest();
    this.requestID = setTimeout(timeoutFunction, delay);
  }

  public cancelRequest() {
    const { requestID } = this;

    if (requestID) {
      clearTimeout(requestID);
      this.requestID = undefined;
    }
  }
}
