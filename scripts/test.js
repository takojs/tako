#!/usr/bin/env node
import fs from "node:fs";

const dir = new URL("../examples/", import.meta.url);
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".ts")).sort();

for (const file of files) {
  const now = new Date();
  console.log(`/// test ${now.toISOString()} ${file}`);
  const fileUrl = new URL(file, dir);
  await import(fileUrl);
  console.log(`///\n`);
}
