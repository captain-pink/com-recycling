import { BATCH_CHUNK_SIZE_LIMIT } from "./constant";

export function paramsAsDataString(params: Record<string, unknown>) {
  return Object.entries(params)
    .sort()
    .filter(([_, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
}

export function asBatch<T>(
  items: Array<T>,
  batchSize = BATCH_CHUNK_SIZE_LIMIT
): Array<Array<T>> {
  const chunks = [];

  for (let index = 0; index < items.length; index += batchSize) {
    chunks.push(items.slice(index, index + batchSize));
  }

  return chunks;
}

export function isProd() {
  return process.env.NODE_ENV === "prod";
}
