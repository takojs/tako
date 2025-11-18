#!/usr/bin/env node
import { Tako } from "../src/index.ts";
import type { TakoArgs } from "../src/index.ts";

const helloArgs: TakoArgs = {
  config: {
    options: {
      name: {
        type: "string",
        short: "n",
        default: "World",
      },
    },
  },
  metadata: {
    help: "Prints a greeting.",
    options: {
      name: {
        help: "Your name.",
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

tako.command("hello", helloArgs, (c) => {
  const { values } = c.scriptArgs;
  c.print({ message: `Hello, ${values.name}!` });
});

tako.cli(rootArgs);
