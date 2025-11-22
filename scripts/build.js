#!/usr/bin/env node
import { cpSync, globSync, mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
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
const files = patterns.flatMap((pattern) => globSync(pattern));

for (const file of files) {
  const relativePath = relative("src", file);
  const destPath = join(outdir, relativePath);
  const destDir = dirname(destPath);
  mkdirSync(destDir, { recursive: true });
  cpSync(file, destPath);
}
