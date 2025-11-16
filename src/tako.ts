import * as path from "node:path";
import * as process from "node:process";
import * as util from "node:util";
import { defaultConfig, defaultMetadata } from "./defaults.ts";
import type {
  ArgsMetadata,
  CommandConfig,
  CommandHandler,
  Options,
  ParseArgsConfig,
  ParsedResults,
  PrintArgs,
  TakoArgs,
} from "./types.ts";

class Tako {
  scriptArgs!: ParsedResults;
  config: ParseArgsConfig = {};
  metadata: ArgsMetadata = {};
  #commands: Map<string, CommandConfig> = new Map();
  #rootHandlers: CommandHandler[] = [];

  print({ message, style, level, value }: PrintArgs): void {
    const effectiveLevel = level ?? "log";
    const outputArgs = Array.isArray(message) ? [...message] : [message];
    if (style && outputArgs.length > 0) {
      outputArgs[0] = util.styleText(style, String(outputArgs[0]));
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

  getRuntimeKey(): string {
    if (typeof (globalThis as any).Bun !== "undefined") {
      return "bun";
    }
    if (typeof (globalThis as any).Deno !== "undefined") {
      return "deno";
    }
    return "node";
  }

  getVersion(): string {
    return this.metadata?.version ?? "";
  }

  getHelp(commandName?: string): string {
    const currentOptions = this.config.options || {};
    const currentMetadataOptions = this.metadata.options;
    let currentCommandMetadata: ArgsMetadata | undefined;
    let commandUsagePart = "";
    if (commandName) {
      const commandConfig = this.#commands.get(commandName);
      if (commandConfig) {
        currentCommandMetadata = commandConfig.metadata;
        commandUsagePart = ` ${commandName}`;
      }
    }

    // Usage Section
    const optionDefinitions = Object.entries(currentOptions).map(([name, opt]) =>
      Object.assign(
        { name },
        opt,
        currentMetadataOptions?.[name] || {},
      )
    );
    const requiredOptions = optionDefinitions.filter((opt) => opt.required);
    const requiredArgs = requiredOptions
      .map((opt) => {
        let usagePart = `-${opt.short}`;
        const placeholder = opt.placeholder
          ? `<${opt.placeholder}>`
          : opt.type === "string" && typeof opt.default === "string"
          ? `<${opt.default}>`
          : "<arg>";
        if (opt.type === "string") {
          usagePart += ` ${placeholder}`;
        }
        return usagePart;
      })
      .join(" ");
    const scriptName = path.basename(process.argv[1] || "");
    const commandNames = Array.from(this.#commands.keys());
    const hasCommands = commandNames.length > 0;
    const runtime = this.getRuntimeKey();
    let usageLine = `${runtime} ${scriptName}`;
    if (commandName) {
      usageLine += commandUsagePart;
      const hasSubCommandsForCommandName = Array.from(this.#commands.keys()).some(
        (cmdName) => cmdName.startsWith(commandName + " "),
      );
      if (hasSubCommandsForCommandName) {
        usageLine += " [COMMAND]";
      }
    } else if (hasCommands) {
      usageLine += " [COMMAND]";
    }
    if (requiredArgs) {
      usageLine += ` ${requiredArgs}`;
    }
    let helpOutput = `Usage: ${usageLine}`;

    // Description Section
    if (!commandName && this.metadata?.help) {
      helpOutput += `\n\n  ${this.metadata.help}`;
    }
    if (commandName && currentCommandMetadata?.help) {
      helpOutput += `\n\n  ${currentCommandMetadata.help}`;
    }

    // Options Section
    const optionDefinitionsForOptions = Object.entries(currentOptions).map(([name, opt]) =>
      Object.assign(
        { name },
        opt,
        currentMetadataOptions?.[name] || {},
      )
    );
    const paddingOffsetForOptions = 2;
    const fullOptions = optionDefinitionsForOptions.map((def) => {
      const short = def.short ? `-${def.short}, ` : "    ";
      let longPart = `--${def.name}`;
      if (def.type === "boolean") {
        if (this.config.allowNegative) {
          longPart = `--[no-]${def.name}`;
        }
      } else if (def.type === "string") {
        const placeholder = def.placeholder
          ? def.placeholder
          : typeof def.default === "string"
          ? `<${def.default}>`
          : "<arg>";
        longPart += ` ${placeholder}`;
      }
      const optionDefinition = short + longPart;
      return {
        ...def,
        optionDefinition,
        length: optionDefinition.length,
      };
    });
    const maxOptionLength = Math.max(0, ...fullOptions.map((opt) => opt.length));
    const targetWidthForOptions = maxOptionLength + paddingOffsetForOptions;
    const lines = fullOptions.map((opt) => {
      const requiredPadding = targetWidthForOptions - opt.length;
      const padding = " ".repeat(requiredPadding);
      let description = opt.help || "";
      if (opt.required) {
        description += " (Required)";
      }
      return `  ${opt.optionDefinition}${padding}${description}`;
    });
    if (lines.length > 0) {
      helpOutput += "\n\nOptions:\n" + lines.join("\n");
    }

    // Commands Section
    let commandLines: string[] = [];
    if (hasCommands) {
      const filteredCommandNames = commandName
        ? commandNames.filter((name) => name.startsWith(commandName + " ") && name !== commandName)
        : commandNames.filter((name) => !name.includes(" "));

      const commandsWithMeta = filteredCommandNames
        .map((name) => ({
          name,
          help: this.#commands.get(name)?.metadata?.help || "",
        }));
      const maxCommandLength = Math.max(0, ...commandsWithMeta.map((cmd) => cmd.name.length));
      const paddingOffset = 4;
      const targetWidth = maxCommandLength + paddingOffset;
      commandLines = commandsWithMeta.map((cmd) => {
        const displayCommandName = commandName ? cmd.name.substring(commandName.length + 1) : cmd.name;
        const requiredPadding = targetWidth - displayCommandName.length;
        const padding = " ".repeat(requiredPadding);
        return `  ${displayCommandName}${padding}${cmd.help}`;
      });
    }
    if (commandLines.length > 0) {
      helpOutput += "\n\nCommands:\n" + commandLines.join("\n");
    }

    return helpOutput;
  }

  genDocs(): string {
    const docs: string[] = [];
    docs.push(this.getHelp());
    for (const commandName of this.#commands.keys()) {
      docs.push(this.getHelp(commandName));
    }
    return docs.join("\n\n");
  }

  command(name: string, { config, metadata }: TakoArgs, ...handlers: CommandHandler[]): this {
    const normalizedName = name.trim().split(" ").filter(Boolean).join(" ");
    if (!normalizedName) {
      this.#rootHandlers.push(...handlers);
      return this;
    }
    const existingConfig = this.#commands.get(normalizedName);
    const commandConfig: CommandConfig = {
      handlers: [...(existingConfig?.handlers || []), ...handlers],
      config: { ...(existingConfig?.config || {}), ...(config || {}) },
      metadata: { ...(existingConfig?.metadata || {}), ...(metadata || {}) },
    };
    this.#commands.set(normalizedName, commandConfig);
    return this;
  }

  cli({ config, metadata }: TakoArgs, ...rootHandlers: CommandHandler[]): void {
    this.config = { ...defaultConfig, ...(config || {}) };
    this.metadata = { ...defaultMetadata, ...(metadata || {}) };
    this.#rootHandlers.push(...rootHandlers);
    let globalParseOptions: Options = this.config.options || {};
    for (const commandConfig of this.#commands.values()) {
      globalParseOptions = { ...globalParseOptions, ...(commandConfig.config?.options || {}) };
    }

    // Global Parse
    try {
      this.scriptArgs = util.parseArgs({
        args: this.config.args,
        options: globalParseOptions,
        strict: this.config.strict,
        allowPositionals: this.config.allowPositionals,
        allowNegative: this.config.allowNegative,
        tokens: this.config.tokens,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.print({ message: `Parse Error: ${message}\n`, style: "red", level: "error" });
      this.print({ message: this.getHelp() });
      process.exit(1);
    }

    // Global Flag Handling
    const { positionals: globalPositionals, values: globalValues } = this.scriptArgs;
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
    let bestCommandConfig: CommandConfig | undefined;
    let bestCommandName: string | undefined;
    let bestPositionalsConsumed = 0;
    if (globalPositionals.length > 0) {
      for (let i = globalPositionals.length; i > 0; i--) {
        const potentialCommandWithSpaces = globalPositionals.slice(0, i).join(" ");
        if (this.#commands.has(potentialCommandWithSpaces)) {
          bestCommandConfig = this.#commands.get(potentialCommandWithSpaces);
          bestCommandName = potentialCommandWithSpaces;
          bestPositionalsConsumed = i;
          break;
        }
      }
    }
    let commandConfig = bestCommandConfig;
    const commandName = bestCommandName;
    const positionalsConsumed = bestPositionalsConsumed;
    if (commandConfig) {
      this.config = {
        ...this.config,
        ...(commandConfig.config || {}),
        options: {
          ...(this.config.options || {}),
          ...(commandConfig.config?.options || {}),
        },
      };
      const commandMetadata = commandConfig.metadata || {};
      this.metadata = {
        ...this.metadata,
        ...commandMetadata,
        options: {
          ...(this.metadata.options || {}),
          ...(commandMetadata.options || {}),
        },
      };
    }
    if (globalValues.help) {
      this.print({ message: this.getHelp(commandName) });
      return;
    }

    // Command Execution
    if (!commandConfig && globalPositionals.length === 0 && this.#rootHandlers.length > 0) {
      commandConfig = { handlers: this.#rootHandlers };
    }
    if (!commandConfig) {
      if (globalPositionals.length > 0) {
        this.print({
          message: `Error: Unknown command "${globalPositionals.join(" ")}"\n`,
          style: "red",
          level: "error",
        });
        this.print({ message: this.getHelp() });
        process.exit(1);
      }
      this.print({ message: this.getHelp() });
      return;
    }
    try {
      this.scriptArgs = util.parseArgs({
        args: this.config.args,
        options: this.config.options || {},
        strict: this.config.strict,
        allowPositionals: this.config.allowPositionals,
        allowNegative: this.config.allowNegative,
        tokens: this.config.tokens,
      });
      this.scriptArgs.positionals = this.scriptArgs.positionals.slice(positionalsConsumed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.print({ message: `Parse Error: ${message}\n`, style: "red", level: "error" });
      this.print({ message: this.getHelp(commandName) });
      process.exit(1);
    }
    if (commandConfig?.handlers && commandConfig.handlers.length > 0) {
      let handlerIndex = 0;
      const executeNext = () => {
        if (handlerIndex < commandConfig.handlers.length) {
          const handler = commandConfig.handlers[handlerIndex]!;
          handlerIndex++;
          try {
            handler(this, executeNext);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            this.print({ message: `Execution Error: ${message}\n`, style: "red", level: "error" });
            this.print({ message: this.getHelp(commandName) });
            process.exit(1);
          }
        }
      };
      executeNext();
    } else {
      this.print({ message: this.getHelp() });
      return;
    }
  }
}

export { Tako };
