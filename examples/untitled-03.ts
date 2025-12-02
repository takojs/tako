#!/usr/bin/env node
import { Tako } from "../src/index.ts";
import type { TakoArgs, TakoHandler } from "../src/index.ts";

const authMiddleware: TakoHandler = (c, next) => {
  const { token } = c.scriptArgs.values;
  const { value } = c.metadata.options?.token as { value?: string };
  if (typeof token !== "string" || token !== value) {
    c.print({
      message: "Authentication failed!",
      style: "red",
      level: "error",
    });
    return;
  }
  c.print({ message: "Authenticated!", style: "bgGreen" });
  return next();
};

const secretArgs: TakoArgs = {
  config: {
    options: {
      token: {
        type: "string",
        short: "t",
      },
    },
  },
  metadata: {
    help: "This command requires authentication.",
    options: {
      token: {
        help: "Your secret.",
        value: "dQw4w9WgXcQ",
      },
    },
  },
};

const rootArgs: TakoArgs = {
  metadata: {
    version: "0.1.0",
    help: "Untitled",
  },
};

const tako = new Tako();

tako.command("secret", secretArgs, authMiddleware, (c) => {
  c.print({ message: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
});

await tako.cli(rootArgs);
