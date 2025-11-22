#!/usr/bin/env node
import { Tako } from "../src/index.ts";

const tako = new Tako();

await tako.cli({}, (c) => c.print({ message: crypto.randomUUID() }));
