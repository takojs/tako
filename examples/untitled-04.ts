#!/usr/bin/env node
import { helper as h, middleware as m, Tako } from "../src/index.ts";
import type { StandardSchemaV1, TakoArgs } from "../src/index.ts";

interface StringSchema extends StandardSchemaV1<string> {
  type: "string";
  message: string;
}

function isString(): StringSchema {
  const message = "Invalid string.";
  return {
    type: "string",
    message,
    "~standard": {
      version: 1,
      vendor: "tako",
      validate(value) {
        return typeof value === "string" ? { value } : { issues: [{ message, path: [] }] };
      },
    },
  };
}

const rootArgs: TakoArgs = {
  metadata: {
    cliExit: false,
    cliName: "tako",
    version: "0.1.0",
    help: "Untitled",
  },
};

const tako = new Tako();

const errorHandler = (err: unknown): void => {
  const message = err instanceof Error ? err.message : String(err);
  tako.print({ message: `Error: ${message}`, style: "red", level: "error" });
};

tako.command("middleware", {}, m.v("argv0", isString()), (c) => {
  c.print({ message: c.argv0 });
});

tako.command("invalid-validation", {}, m.v("argv", isString()), (c) => {
  c.print({ message: c.argv[0] });
});

tako.command("helper", {}, (c) => {
  h.v(c.argv0, isString()).then((res) => {
    c.print({ message: res });
  }).catch(errorHandler);
});

tako.command("async-validation", {}, async (c) => {
  const result = await h.v(c.argv0, isString());
  c.print({ message: result });
});

tako.cli(rootArgs).catch(errorHandler);
