#!/usr/bin/env deno
// deno-lint-ignore no-import-prefix no-unversioned-import
import { Tako } from "jsr:@takojs/tako";

const tako = new Tako();

tako.cli({}, (c) => c.print({ message: crypto.randomUUID() }));
