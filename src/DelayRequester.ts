import { canceledError } from './hasCanceledError';
import SetTimeoutRequest from './SetTimeoutRequest';

export default class DelayRequester {
  private readonly timeoutInner: number;

  private readonly setTimeoutRequestInner: SetTimeoutRequest;

  private rejectInner?: (reason?: Error) => void;

  public constructor(timeout: number) {
    this.timeoutInner = timeout;
    this.setTimeoutRequestInner = new SetTimeoutRequest();
  }

  public async request(timeoutForce?: number): Promise<void> {
    this.cancelRequest();

    return new Promise<void>((resolve, reject) => {
      this.rejectInner = reject;

      const timeout = timeoutForce ?? this.timeoutInner;

      this.setTimeoutRequestInner.request(resolve, timeout);
    });
  }

  public cancelRequest() {
    this.setTimeoutRequestInner.cancelRequest();

    if (this.rejectInner) {
      this.rejectInner(canceledError);
    }
  }
}
