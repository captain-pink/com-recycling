import { BaseResponse } from ".";
import { ResponseStatus } from "../constant";

export class BaseSerivce {
  protected async replyWithBaseResponse(action: () => Promise<unknown>) {
    try {
      await action();

      return new BaseResponse(ResponseStatus.OK);
    } catch (error) {
      console.error(error);
      return new BaseResponse(ResponseStatus.FAILED);
    }
  }
}
