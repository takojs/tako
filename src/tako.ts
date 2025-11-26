import { basename } from "node:path";
import * as process from "node:process";
import * as util from "node:util";
import { defaultConfig, defaultMetadata } from "./defaults.ts";
import type {
  ArgsMetadata,
  CommandDefinition,
  DeepReadonly,
  ParseArgsConfig,
  ParsedResults,
  PrintArgs,
  Runtime,
  ScriptArgs,
  TakoArgs,
  TakoHandler,
} from "./types.ts";

class Tako {
  readonly argv: readonly string[] = process.argv;
  readonly argv0: string = process.argv0;
  #scriptArgs: ParsedResults = { values: {}, positionals: [] };
  args: ScriptArgs = { values: {}, positionals: [] };
  #config: ParseArgsConfig = { options: {} };
  metadata: ArgsMetadata = { options: {} };
  #commands: Map<string, CommandDefinition> = new Map();
  #rootHandlers: TakoHandler[] = [];

  get scriptArgs(): DeepReadonly<ParsedResults> {
    return this.#scriptArgs;
  }

  get config(): DeepReadonly<ParseArgsConfig> {
    return this.#config;
  }

  print({ message, style, level, value }: PrintArgs): void {
    const effectiveLevel = level ?? "log";
    let outputArgs = Array.isArray(message) ? [...message] : [message];
    if (style) {
      outputArgs = outputArgs.map((arg) => util.styleText(style, String(arg)));
    }
    if (effectiveLevel === "assert") {
      console.assert(value ?? false, ...outputArgs);
    } else if (effectiveLevel === "debug") {
      console.debug(...outputArgs);
    } else if (effectiveLevel === "error") {
      console.error(...outputArgs);
    } else if (effectiveLevel === "info") {
      console.info(...outputArgs);
    } else if (effectiveLevel === "log") {
      console.log(...outputArgs);
    } else if (effectiveLevel === "trace") {
      console.trace(...outputArgs);
    } else if (effectiveLevel === "warn") {
      console.warn(...outputArgs);
    }
  }

  fail(err: unknown): never {
    const message = err instanceof Error ? err.message : String(err);
    console.error(util.styleText("red", `Error: ${message}\n\n  Try '-h, --help' for help.`));
    process.exit(1);
  }

  getRuntimeKey(): Runtime {
    // deno-lint-ignore no-explicit-any
    if (typeof (globalThis as any).Bun !== "undefined") {
      return "bun";
    }
    // deno-lint-ignore no-explicit-any
    if (typeof (globalThis as any).Deno !== "undefined") {
      return "deno";
    }
    return "node";
  }

  getVersion(): string {
    return this.metadata?.version ?? "";
  }

  getHelp(commandName?: string): string {
    const sections: string[] = [];
    let currentOptions = this.#config.options;
    let currentMetadataOptions = this.metadata.options;
    let currentCommandMetadata: ArgsMetadata | undefined;
    if (commandName) {
      const commandDefinition = this.#commands.get(commandName);
      if (commandDefinition) {
        currentOptions = {
          ...this.#config.options,
          ...(commandDefinition.config?.options || {}),
        };
        currentMetadataOptions = {
          ...this.metadata.options,
          ...(commandDefinition.metadata?.options || {}),
        };
        currentCommandMetadata = commandDefinition.metadata;
      }
    }

    // Usage Section
    const usageParts: string[] = [];
    const optionDefinitions = Object.entries(currentOptions || {}).map(([name, opt]) => ({
      name,
      ...opt,
      ...(currentMetadataOptions?.[name] || {}),
    }));
    const runtimeName = basename(this.argv[0] || "");
    const scriptName = basename(this.argv[1] || "");
    usageParts.push("Usage:", this.metadata?.cliName ?? `${runtimeName} ${scriptName}`);
    if (commandName) {
      usageParts.push(commandName);
    }
    if (optionDefinitions.length > 0) {
      usageParts.push("[OPTIONS]");
    }
    const commandNames = Array.from(this.#commands.keys());
    const hasSubCommands = commandName
      ? commandNames.some((name) => name.startsWith(`${commandName} `) && name !== commandName)
      : commandNames.length > 0;
    if (hasSubCommands) {
      usageParts.push("COMMAND", "[ARGS]...");
    } else {
      const meta = commandName ? currentCommandMetadata : this.metadata;
      if (meta?.placeholder) {
        usageParts.push(meta.placeholder);
      }
    }
    sections.push(usageParts.join(" "));

    // Explanation Section
    const explanationLines: string[] = [];
    const metaForExplanation = commandName ? currentCommandMetadata : this.metadata;
    if (metaForExplanation?.help) {
      explanationLines.push(metaForExplanation.help || "");
    }
    if (metaForExplanation?.required) {
      explanationLines.push("(positionals required)");
    }
    if (explanationLines.length > 0) {
      sections.push(`  ${explanationLines.join(" ")}`);
    }

    // Options Section
    const fullOptions = optionDefinitions.map((opt) => {
      const shortOptionPart = opt.short ? `-${opt.short}, ` : "    ";
      let longOptionPart = `--${opt.name}`;
      if (opt.type === "boolean" && this.#config.allowNegative && opt.name !== "help" && opt.name !== "version") {
        longOptionPart = `--[no-]${opt.name}`;
      }
      const valuePlaceholder = opt.placeholder || "<value>";
      const placeholderPart = opt.type === "string" ? ` ${valuePlaceholder}` : "";
      const optionDefinition = `${shortOptionPart}${longOptionPart}${placeholderPart}`;
      return {
        ...opt,
        optionDefinition,
        length: optionDefinition.length,
      };
    });
    if (fullOptions.length > 0) {
      const maxOptionLength = Math.max(0, ...fullOptions.map((opt) => opt.length));
      const targetWidth = maxOptionLength + 2;
      const lines = fullOptions.map((opt) => {
        const explanationParts: string[] = [];
        if (opt.help) {
          explanationParts.push(opt.help);
        }
        const detailsParts: string[] = [];
        if (opt.required) {
          detailsParts.push("required");
        }
        if (typeof opt.default === "string" || typeof opt.default === "boolean" || Array.isArray(opt.default)) {
          detailsParts.push(`default: ${JSON.stringify(opt.default)}`);
        }
        if (detailsParts.length > 0) {
          explanationParts.push(`(${detailsParts.join(", ")})`);
        }
        const explanation = explanationParts.join(" ");
        const requiredPadding = targetWidth - opt.length;
        const padding = " ".repeat(requiredPadding);
        return `  ${opt.optionDefinition}${padding}${explanation}`;
      });
      sections.push(`Options:\n${lines.join("\n")}`);
    }

    // Commands Section
    if (commandNames.length > 0) {
      const filteredCommandNames = commandName
        ? commandNames.filter((name) => name.startsWith(`${commandName} `) && name !== commandName)
        : commandNames.filter((name) => !name.includes(" "));
      if (filteredCommandNames.length > 0) {
        const commandsWithMeta = filteredCommandNames.map((name) => ({
          name,
          help: this.#commands.get(name)?.metadata?.help || "",
        }));
        const maxCommandLength = Math.max(0, ...commandsWithMeta.map((cmd) => cmd.name.length));
        const targetWidthForCommands = maxCommandLength + 2;
        const commandLines = commandsWithMeta.map((cmd) => {
          const displayCommandName = commandName ? cmd.name.substring(commandName.length + 1) : cmd.name;
          const requiredPadding = targetWidthForCommands - displayCommandName.length;
          const padding = " ".repeat(requiredPadding);
          return `  ${displayCommandName}${padding}${cmd.help}`;
        });
        sections.push(`Commands:\n${commandLines.join("\n")}`);
      }
    }

    return sections.filter(Boolean).join("\n\n");
  }

  genDocs(): string {
    const docs: string[] = [];
    docs.push(this.getHelp());
    for (const commandName of this.#commands.keys()) {
      docs.push(this.getHelp(commandName));
    }
    return docs.join("\n\n");
  }

  #mergeConfig(base?: ParseArgsConfig, overrides?: ParseArgsConfig): ParseArgsConfig {
    return {
      ...(base || {}),
      ...(overrides || {}),
      options: {
        ...(base?.options || {}),
        ...(overrides?.options || {}),
      },
    };
  }

  #mergeMetadata(base?: ArgsMetadata, overrides?: ArgsMetadata): ArgsMetadata {
    return {
      ...(base || {}),
      ...(overrides || {}),
      options: {
        ...(base?.options || {}),
        ...(overrides?.options || {}),
      },
    };
  }

  command(name: string, { config, metadata }: TakoArgs, ...handlers: TakoHandler[]): this {
    const normalizedName = name.trim().split(" ").filter(Boolean).join(" ");
    if (!normalizedName) {
      this.#rootHandlers.push(...handlers);
      return this;
    }
    const existingDefinition = this.#commands.get(normalizedName);
    const commandDefinition = {
      handlers: [...(existingDefinition?.handlers || []), ...handlers],
      config: this.#mergeConfig(existingDefinition?.config, config),
      metadata: this.#mergeMetadata(existingDefinition?.metadata, metadata),
    };
    this.#commands.set(normalizedName, commandDefinition);
    return this;
  }

  async cli({ config, metadata }: TakoArgs, ...rootHandlers: TakoHandler[]): Promise<void> {
    this.#config = this.#mergeConfig(defaultConfig, config);
    this.metadata = this.#mergeMetadata(defaultMetadata, metadata);
    this.#rootHandlers.push(...rootHandlers);

    // Global Parse
    let globalParseOptions = this.#config.options;
    for (const commandDefinition of this.#commands.values()) {
      globalParseOptions = { ...globalParseOptions, ...(commandDefinition.config?.options || {}) };
    }
    try {
      this.#scriptArgs = util.parseArgs({
        args: this.#config.args,
        options: globalParseOptions,
        strict: this.#config.strict,
        allowPositionals: this.#config.allowPositionals,
        allowNegative: this.#config.allowNegative,
        tokens: this.#config.tokens,
      });
    } catch (err: unknown) {
      this.fail(err);
    }
    const { positionals: globalPositionals, values: globalValues } = this.#scriptArgs;
    if (globalValues.version) {
      const version = this.getVersion();
      if (version) {
        this.print({ message: version });
      }
      return;
    }
    if (globalValues.gen === "docs") {
      const docs = this.genDocs();
      if (docs) {
        this.print({ message: docs });
      }
      return;
    }

    // Command Resolution
    let bestCommandDefinition: CommandDefinition | undefined;
    let bestCommandName: string | undefined;
    let bestPositionalsConsumed = 0;
    if (globalPositionals.length > 0) {
      for (let i = globalPositionals.length; i > 0; i--) {
        const potentialCommandWithSpaces = globalPositionals.slice(0, i).join(" ");
        if (this.#commands.has(potentialCommandWithSpaces)) {
          bestCommandDefinition = this.#commands.get(potentialCommandWithSpaces);
          bestCommandName = potentialCommandWithSpaces;
          bestPositionalsConsumed = i;
          break;
        }
      }
    }
    let commandDefinition = bestCommandDefinition;
    const commandName = bestCommandName;
    const positionalsConsumed = bestPositionalsConsumed;
    if (commandDefinition) {
      this.#config = this.#mergeConfig(this.#config, commandDefinition.config);
      this.metadata = this.#mergeMetadata(this.metadata, commandDefinition.metadata);
    }
    if (globalValues.help) {
      this.print({ message: this.getHelp(commandName) });
      return;
    }

    // Command Parse
    if (!commandDefinition && globalPositionals.length === 0 && this.#rootHandlers.length > 0) {
      commandDefinition = { handlers: this.#rootHandlers };
    }
    if (!commandDefinition) {
      if (globalPositionals.length > 0) {
        this.fail(`Unknown command '${globalPositionals.join(" ")}'`);
      }
      this.print({ message: this.getHelp() });
      return;
    }
    try {
      this.#scriptArgs = util.parseArgs({
        args: this.#config.args,
        options: this.#config.options,
        strict: this.#config.strict,
        allowPositionals: this.#config.allowPositionals,
        allowNegative: this.#config.allowNegative,
        tokens: this.#config.tokens,
      });
      this.#scriptArgs.positionals = this.#scriptArgs.positionals.slice(positionalsConsumed);
    } catch (err: unknown) {
      this.fail(err);
    }

    // Validate Arguments
    if (this.metadata.options) {
      for (const [name, meta] of Object.entries(this.metadata.options)) {
        if (meta.required && !(name in this.#scriptArgs.values)) {
          const opt = this.#config.options?.[name];
          const shortOptionPart = opt?.short ? `-${opt.short}, ` : "";
          let longOptionPart = `--${name}`;
          if (opt?.type === "boolean" && this.#config.allowNegative) {
            longOptionPart = `--[no-]${name}`;
          }
          const valuePlaceholder = meta.placeholder || "<value>";
          const placeholderPart = opt?.type === "string" ? ` ${valuePlaceholder}` : "";
          const optionDefinition = `${shortOptionPart}${longOptionPart}${placeholderPart}`;
          this.fail(`Missing required option '${optionDefinition}'`);
        }
      }
    }
    if (this.metadata.required) {
      if (this.#scriptArgs.positionals.length === 0) {
        const placeholderPart = this.metadata.placeholder ? ` '${this.metadata.placeholder}'` : "";
        this.fail(`Missing required positional arguments${placeholderPart}`);
      }
    }

    // Execute Handlers
    if (commandDefinition.handlers.length > 0) {
      let handlerIndex = 0;
      const next = async () => {
        if (handlerIndex < commandDefinition.handlers.length) {
          const handler = commandDefinition.handlers[handlerIndex]!;
          handlerIndex++;
          try {
            await handler(this, next);
          } catch (err: unknown) {
            this.fail(err);
          }
        }
      };
      await next();
    } else {
      this.print({ message: this.getHelp() });
    }
  }
}

export { Tako };
