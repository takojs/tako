import type { TakoHandler } from "./types.ts";
import type { StandardSchemaV1 } from "./standard-schema.ts";

const targets = ["argv", "argv0", "scriptArgs", "args", "config", "metadata"] as const;

export function v(target: typeof targets[number], ...schemas: StandardSchemaV1[]): TakoHandler {
  return async (c, next) => {
    if (!targets.includes(target)) {
      throw new Error(
        `Invalid validation target '${target}'.\nSupported targets are '${targets.join("', '")}'.`,
      );
    }
    for (const schema of schemas) {
      let result = schema["~standard"].validate(c[target]);
      if (result instanceof Promise) {
        result = await result;
      }
      if (result.issues) {
        throw new Error(`Validation failed.\n${JSON.stringify(result.issues, null, 2)}`);
      }
    }
    return next();
  };
}
