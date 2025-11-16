#!/usr/bin/env node
import * as esbuild from "esbuild";
import pkg from "../package.json" with { type: "json" };

const js = `/*!
 * ${pkg.name}
 *
 * SPDX-License-Identifier: ${pkg.license}
 * SPDX-FileCopyrightText: 2025 ${pkg.author}
 * SPDX-FileComment: Version ${pkg.version}
 */`;
const outdirs = ["dist", "scripts"];

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
