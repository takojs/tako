#!/usr/bin/env deno
// @ts-ignore: Required HTTP import syntax
// deno-lint-ignore no-import-prefix
import { Tako } from "https://raw.githubusercontent.com/takojs/tako/refs/heads/main/src/index.ts";

const tako = new Tako();

await tako.cli({}, (c) => c.print({ message: crypto.randomUUID() }));
