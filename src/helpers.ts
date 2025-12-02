import type { StandardSchemaV1 } from "./standard-schema.ts";
import type { DeepReadonly } from "./types.ts";

export async function v<T extends StandardSchemaV1>(
  input: DeepReadonly<StandardSchemaV1.InferInput<T>>,
  ...schemas: T[]
): Promise<StandardSchemaV1.InferOutput<T>> {
  let lastResult: StandardSchemaV1.SuccessResult<unknown> | undefined;
  for (const schema of schemas) {
    let result = schema["~standard"].validate(input);
    if (result instanceof Promise) {
      result = await result;
    }
    if (result.issues) {
      throw new Error(`Validation failed.\n${JSON.stringify(result.issues, null, 2)}`);
    }
    lastResult = result;
  }
  if (!lastResult) {
    throw new Error("No schema provided.");
  }
  return lastResult.value;
}
