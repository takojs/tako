import type { styleText } from "node:util";
import type { Tako } from "./tako.ts";

export type ConsoleLevel = "assert" | "debug" | "error" | "info" | "log" | "trace" | "warn" | "none";

export type Style = Parameters<typeof styleText>[0];

export interface PrintArgs {
  message: string | string[];
  style?: Style;
  level?: ConsoleLevel;
  value?: boolean;
}

export interface ParseArgsOptionsConfig {
  type: "boolean" | "string";
  short?: string;
  default?: string | boolean | string[] | boolean[];
  multiple?: boolean;
}

export type Options = Record<string, ParseArgsOptionsConfig>;

export interface ParseArgsConfig {
  args?: string[];
  options?: Options;
  strict?: boolean;
  allowPositionals?: boolean;
  allowNegative?: boolean;
  tokens?: boolean;
}

export interface ParsedResults {
  values: Record<string, any>;
  positionals: string[];
  tokens?: Record<string, any>[];
}

export interface OptionsMetadata {
  help?: string;
  placeholder?: string;
  required?: boolean;
  [key: string]: any;
}

export interface ArgsMetadata {
  help?: string;
  version?: string;
  options?: Record<string, OptionsMetadata>;
}

export type TakoHandler = (c: Tako, next: () => Promise<void> | void) => Promise<void> | void;

export interface CommandDefinition {
  handlers: TakoHandler[];
  config?: ParseArgsConfig;
  metadata?: ArgsMetadata;
}

export interface TakoArgs {
  config?: ParseArgsConfig;
  metadata?: ArgsMetadata;
}
