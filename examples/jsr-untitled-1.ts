#!/usr/bin/env deno
// @ts-ignore: Required JSR import syntax
// deno-lint-ignore no-import-prefix no-unversioned-import
import { Tako } from "jsr:@takojs/tako";

const tako = new Tako();

await tako.cli({}, (c) => c.print({ message: crypto.randomUUID() }));
