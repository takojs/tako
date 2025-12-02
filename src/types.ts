import type { BackgroundColors, ForegroundColors, Modifiers } from "./colors.ts";
import type { Tako } from "./tako.ts";

export type DeepReadonly<T> = T extends object ? { readonly [P in keyof T]: DeepReadonly<T[P]> } : T;

export type ConsoleStyle =
  | ForegroundColors
  | BackgroundColors
  | Modifiers
  | (ForegroundColors | BackgroundColors | Modifiers)[];

export type ConsoleLevel = "assert" | "debug" | "error" | "info" | "log" | "trace" | "warn" | "none";

export interface PrintArgs {
  message?: string | string[];
  style?: ConsoleStyle;
  level?: ConsoleLevel;
  value?: boolean;
}

export interface ParseArgsOptionDescriptor {
  type: "boolean" | "string";
  short?: string;
  default?: string | boolean | string[] | boolean[];
  multiple?: boolean;
}

export interface ParseArgsConfig {
  args?: string[];
  options?: {
    [key: string]: ParseArgsOptionDescriptor;
  };
  strict?: boolean;
  allowPositionals?: boolean;
  allowNegative?: boolean;
  tokens?: boolean;
}

export type OptionToken = {
  kind: "option";
  index: number;
  name: string;
  rawName: string;
  value: string;
  inlineValue: boolean;
} | {
  kind: "option";
  index: number;
  name: string;
  rawName: string;
  value: undefined;
  inlineValue: undefined;
};

export type Token = OptionToken | {
  kind: "positional";
  index: number;
  value: string;
} | {
  kind: "option-terminator";
  index: number;
};

export interface ParsedResults {
  values: {
    [key: string]: string | boolean | (string | boolean)[] | undefined;
  };
  positionals: string[];
  tokens?: Token[];
}

export type PrimitiveValue = string | number | bigint | boolean | null;

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
  [key: string]: PrimitiveValue | PrimitiveValue[] | undefined;
}

export interface ArgsMetadata {
  cliExit?: boolean;
  cliName?: string;
  version?: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
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
