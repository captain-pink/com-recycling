import { registerEnumType } from "type-graphql";
import { DeviceType } from "../../db/dynamo/constant";

export enum ErrorCode {
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  FORBIDDEN = "FORBIDDEN",
  FAILED = "FAILED",
  NOT_FOUND = "NOT_FOUND",
  INVALID_ARGUMENT = "INVALID_ARGUMENT",
}

export enum ResponseStatus {
  OK = "OK",
  FAILED = "FAILED",
}

registerEnumType(ResponseStatus, { name: "ResponseStatus" });

export enum TimeMeasurement {
  MIN,
  HOUR,
  DAY,
}

registerEnumType(TimeMeasurement, { name: "TimeMeasurement" });

export const BATCH_CHUNK_SIZE_LIMIT = 25;

registerEnumType(DeviceType, { name: "DeviceType" });
