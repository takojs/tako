import type { styleText } from "node:util";
import type { Tako } from "./tako.ts";

export type DeepReadonly<T> = T extends object ? { readonly [P in keyof T]: DeepReadonly<T[P]> } : T;

export type Runtime = "node" | "deno" | "bun";

export type Style = Parameters<typeof styleText>[0];

export type ConsoleLevel = "assert" | "debug" | "error" | "info" | "log" | "trace" | "warn" | "none";

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

export interface ParseArgsConfig {
  args?: string[];
  options?: {
    [key: string]: ParseArgsOptionsConfig;
  };
  strict?: boolean;
  allowPositionals?: boolean;
  allowNegative?: boolean;
  tokens?: boolean;
}

export interface ParsedResults {
  values: {
    [key: string]: string | boolean | (string | boolean)[] | undefined;
  };
  positionals: string[];
  tokens?: {
    // deno-lint-ignore no-explicit-any
    [key: string]: any;
  }[];
}

export type PrimitiveValue = string | number | bigint | boolean | symbol | null;

export interface ScriptArgs {
  values: {
    [key: string]: PrimitiveValue | PrimitiveValue[] | undefined;
  };
  positionals: PrimitiveValue[];
}

export interface OptionsMetadata {
  help?: string;
  placeholder?: string;
  required?: boolean;
  [key: string]: PrimitiveValue | undefined;
}

export interface ArgsMetadata {
  help?: string;
  version?: string;
  options?: {
    [key: string]: OptionsMetadata;
  };
}

export interface TakoArgs {
  config?: ParseArgsConfig;
  metadata?: ArgsMetadata;
}

export type TakoHandler = (c: Tako, next: () => Promise<void> | void) => Promise<void> | void;

export interface CommandDefinition {
  handlers: TakoHandler[];
  config?: ParseArgsConfig;
  metadata?: ArgsMetadata;
}
