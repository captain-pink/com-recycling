import { model } from "dynamoose";
import { ModelType } from "dynamoose/dist/General";
import { Item } from "dynamoose/dist/Item";
import { ModelTableOptions } from "dynamoose/dist/Model";
import { Schema, ValueType } from "dynamoose/dist/Schema";

export function StringLessOrEqual(operand: number) {
  return (value: ValueType) => (value as string).length <= operand;
}

export function NumberGreaterThanOrEqual(operand: number) {
  return (value: ValueType) => (value as number) >= operand;
}

export function NumberLessThanOrEqual(operand: number) {
  return (value: ValueType) => (value as number) <= operand;
}

export function DateIsInFuture(operand?: Date) {
  return (value: ValueType) => (value as Date) > (operand || new Date());
}

export function composeValidators(
  ...validators: ((value: ValueType) => boolean)[]
) {
  return (value: ValueType) => validators.every((v) => v(value));
}

export function createModel<I extends Item>(
  modelName: string,
  schema: Schema,
  options: ModelTableOptions
): ModelType<I> {
  return model<I>(modelName, schema, {
    ...options,
    create: process.env.NODE_ENV === "prod" ? false : true,
    initialize: true,
  });
}
