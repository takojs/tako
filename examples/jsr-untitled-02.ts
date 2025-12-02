#!/usr/bin/env deno
// @ts-ignore: Required JSR import syntax
// deno-lint-ignore no-import-prefix no-unversioned-import
import { Tako } from "jsr:@takojs/tako";
// @ts-ignore: Required JSR import syntax
// deno-lint-ignore no-import-prefix no-unversioned-import
import * as v from "jsr:@valibot/valibot";

const runtimeArgs: TakoArgs = {
  metadata: {
    help: "Requires deno runtime.",
  },
};

const rootArgs: TakoArgs = {
  metadata: {
    version: "0.1.0",
    help: "Untitled",
  },
};

const tako = new Tako();

const runtimeValidator = m.v("argv0", v.literal("deno"));

tako.command("runtime", runtimeArgs, runtimeValidator, (c) => {
  c.print({ message: c.argv0 });
});

await tako.cli(rootArgs);
