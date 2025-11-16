#!/usr/bin/env node
import { Tako } from "./index.js";

const hello = {
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

const config = {
  metadata: {
    version: "1.0.0",
    help: "Tako - a CLI framework that works on any JavaScript runtime.",
  },
};

const tako = new Tako();

tako.command("hello", hello, (c) => {
  const { values } = c.scriptArgs;
  c.print({ message: `Hello, ${values.name}!` });
});

tako.cli(config);
