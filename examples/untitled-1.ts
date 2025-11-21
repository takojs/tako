#!/usr/bin/env node
import { Tako } from "../src/index.ts";

const tako = new Tako();

tako.cli({}, (c) => c.print({ message: crypto.randomUUID() }));
