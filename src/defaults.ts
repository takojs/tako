import type { ArgsMetadata, ParseArgsConfig } from "./types.ts";

export const defaultConfig: ParseArgsConfig = {
  options: {
    gen: {
      type: "string",
      short: "g",
    },
    help: {
      type: "boolean",
      short: "h",
    },
    version: {
      type: "boolean",
      short: "v",
    },
  },
  strict: true,
  allowPositionals: true,
  allowNegative: false,
  tokens: false,
};

export const defaultMetadata: ArgsMetadata = {
  cliExit: true,
  options: {
    gen: {
      help: "Generate documentation.",
      placeholder: "docs",
    },
    help: {
      help: "Show help.",
    },
    version: {
      help: "Show version.",
    },
  },
};
