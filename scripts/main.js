#!/usr/bin/env node
import { Tako } from "./index.js";
import pkg from "../package.json" with { type: "json" };

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
    version: pkg.version,
    help: pkg.description,
  },
};

const tako = new Tako();

tako.command("hello", hello, (c) => {
  const { values } = c.scriptArgs;
  c.print({ message: `Hello, ${values.name}!` });
});

tako.cli(config);
