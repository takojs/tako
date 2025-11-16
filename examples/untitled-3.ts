#!/usr/bin/env node
import { Tako } from "../src/index.ts";
import type { TakoArgs } from "../src/types.ts";

function authMiddleware(c: Tako, next: () => void): void {
  const { token } = c.scriptArgs.values;
  const { value } = c.metadata.options?.token as { value: string };
  if (!value || token !== value) {
    c.print({ message: "Authentication failed!", style: "red", level: "error" });
    return;
  }
  c.print({ message: `Authenticated!`, style: "bgGreen" });
  next();
}

const secret: TakoArgs = {
  config: {
    options: {
      token: {
        type: "string",
        short: "t",
      },
    },
  },
  metadata: {
    help: "A command that requires authentication.",
    options: {
      token: {
        help: "Your secret.",
        value: "dQw4w9WgXcQ",
      },
    },
  },
};

const config: TakoArgs = {
  metadata: {
    version: "0.1.0",
    help: "Untitled",
  },
};

const tako = new Tako();

tako.command("secret", secret, authMiddleware, (c) => {
  c.print({ message: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
});

tako.cli(config);
