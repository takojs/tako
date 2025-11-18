#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import * as esbuild from "esbuild";
import pkg from "../package.json" with { type: "json" };

const js = `/*!
 * ${pkg.name}
 *
 * SPDX-License-Identifier: ${pkg.license}
 * SPDX-FileCopyrightText: 2025 ${pkg.author}
 * SPDX-FileComment: Version ${pkg.version}
 */`;
const outdirs = [
  "dist",
  "scripts",
];

for (const outdir of outdirs) {
  await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outdir,
    platform: "node",
    target: "es2020",
    format: "esm",
    banner: { js },
  });
}

const outdir = "dist";
const patterns = [
  "src/**/*.ts",
  "src/**/*.tsx",
  "src/**/*.cts",
  "src/**/*.mts",
];
const files = patterns.flatMap((pattern) => fs.globSync(pattern));

for (const file of files) {
  const relativePath = path.relative("src", file);
  const destPath = path.join(outdir, relativePath);
  const destDir = path.dirname(destPath);
  fs.mkdirSync(destDir, { recursive: true });
  fs.cpSync(file, destPath);
}
