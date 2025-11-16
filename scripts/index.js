/*!
 * @takojs/tako
 *
 * SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Takuro Kitahara
 * SPDX-FileComment: Version 1.0.0
 */
var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);

// src/tako.ts
import * as path from "node:path";
import * as process from "node:process";
import * as util from "node:util";

// src/defaults.ts
var defaultConfig = {
  options: {
    gen: {
      type: "string",
      short: "g"
    },
    help: {
      type: "boolean",
      short: "h"
    },
    version: {
      type: "boolean",
      short: "v"
    }
  },
  strict: true,
  allowPositionals: true,
  allowNegative: false,
  tokens: false
};
var defaultMetadata = {
  options: {
    gen: {
      help: "Generate documentation.",
      placeholder: "docs"
    },
    help: {
      help: "Show help."
    },
    version: {
      help: "Show version."
    }
  }
};

// src/tako.ts
var _commands, _rootHandlers;
var Tako = class {
  constructor() {
    __publicField(this, "scriptArgs");
    __publicField(this, "config", {});
    __publicField(this, "metadata", {});
    __privateAdd(this, _commands, /* @__PURE__ */ new Map());
    __privateAdd(this, _rootHandlers, []);
  }
  print({ message, style, level, value }) {
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
  getRuntimeKey() {
    if (typeof globalThis.Bun !== "undefined") {
      return "bun";
    }
    if (typeof globalThis.Deno !== "undefined") {
      return "deno";
    }
    return "node";
  }
  getVersion() {
    return this.metadata?.version ?? "";
  }
  getHelp(commandName) {
    const currentOptions = this.config.options || {};
    const currentMetadataOptions = this.metadata.options;
    let currentCommandMetadata;
    let commandUsagePart = "";
    if (commandName) {
      const commandConfig = __privateGet(this, _commands).get(commandName);
      if (commandConfig) {
        currentCommandMetadata = commandConfig.metadata;
        commandUsagePart = ` ${commandName}`;
      }
    }
    const optionDefinitions = Object.entries(currentOptions).map(
      ([name, opt]) => Object.assign(
        { name },
        opt,
        currentMetadataOptions?.[name] || {}
      )
    );
    const requiredOptions = optionDefinitions.filter((opt) => opt.required);
    const requiredArgs = requiredOptions.map((opt) => {
      let usagePart = `-${opt.short}`;
      const placeholder = opt.placeholder ? `<${opt.placeholder}>` : opt.type === "string" && typeof opt.default === "string" ? `<${opt.default}>` : "<arg>";
      if (opt.type === "string") {
        usagePart += ` ${placeholder}`;
      }
      return usagePart;
    }).join(" ");
    const scriptName = path.basename(process.argv[1] || "");
    const commandNames = Array.from(__privateGet(this, _commands).keys());
    const hasCommands = commandNames.length > 0;
    const runtime = this.getRuntimeKey();
    let usageLine = `${runtime} ${scriptName}`;
    if (commandName) {
      usageLine += commandUsagePart;
      const hasSubCommandsForCommandName = Array.from(__privateGet(this, _commands).keys()).some(
        (cmdName) => cmdName.startsWith(commandName + " ")
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
    if (!commandName && this.metadata?.help) {
      helpOutput += `

  ${this.metadata.help}`;
    }
    if (commandName && currentCommandMetadata?.help) {
      helpOutput += `

  ${currentCommandMetadata.help}`;
    }
    const optionDefinitionsForOptions = Object.entries(currentOptions).map(
      ([name, opt]) => Object.assign(
        { name },
        opt,
        currentMetadataOptions?.[name] || {}
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
        const placeholder = def.placeholder ? def.placeholder : typeof def.default === "string" ? `<${def.default}>` : "<arg>";
        longPart += ` ${placeholder}`;
      }
      const optionDefinition = short + longPart;
      return {
        ...def,
        optionDefinition,
        length: optionDefinition.length
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
    let commandLines = [];
    if (hasCommands) {
      const filteredCommandNames = commandName ? commandNames.filter((name) => name.startsWith(commandName + " ") && name !== commandName) : commandNames.filter((name) => !name.includes(" "));
      const commandsWithMeta = filteredCommandNames.map((name) => ({
        name,
        help: __privateGet(this, _commands).get(name)?.metadata?.help || ""
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
  genDocs() {
    const docs = [];
    docs.push(this.getHelp());
    for (const commandName of __privateGet(this, _commands).keys()) {
      docs.push(this.getHelp(commandName));
    }
    return docs.join("\n\n");
  }
  command(name, { config, metadata }, ...handlers) {
    const normalizedName = name.trim().split(" ").filter(Boolean).join(" ");
    if (!normalizedName) {
      __privateGet(this, _rootHandlers).push(...handlers);
      return this;
    }
    const existingConfig = __privateGet(this, _commands).get(normalizedName);
    const commandConfig = {
      handlers: [...existingConfig?.handlers || [], ...handlers],
      config: { ...existingConfig?.config || {}, ...config || {} },
      metadata: { ...existingConfig?.metadata || {}, ...metadata || {} }
    };
    __privateGet(this, _commands).set(normalizedName, commandConfig);
    return this;
  }
  cli({ config, metadata }, ...rootHandlers) {
    this.config = { ...defaultConfig, ...config || {} };
    this.metadata = { ...defaultMetadata, ...metadata || {} };
    __privateGet(this, _rootHandlers).push(...rootHandlers);
    let globalParseOptions = this.config.options || {};
    for (const commandConfig2 of __privateGet(this, _commands).values()) {
      globalParseOptions = { ...globalParseOptions, ...commandConfig2.config?.options || {} };
    }
    try {
      this.scriptArgs = util.parseArgs({
        args: this.config.args,
        options: globalParseOptions,
        strict: this.config.strict,
        allowPositionals: this.config.allowPositionals,
        allowNegative: this.config.allowNegative,
        tokens: this.config.tokens
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.print({ message: `Parse Error: ${message}
`, style: "red", level: "error" });
      this.print({ message: this.getHelp() });
      process.exit(1);
    }
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
    let bestCommandConfig;
    let bestCommandName;
    let bestPositionalsConsumed = 0;
    if (globalPositionals.length > 0) {
      for (let i = globalPositionals.length; i > 0; i--) {
        const potentialCommandWithSpaces = globalPositionals.slice(0, i).join(" ");
        if (__privateGet(this, _commands).has(potentialCommandWithSpaces)) {
          bestCommandConfig = __privateGet(this, _commands).get(potentialCommandWithSpaces);
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
        ...commandConfig.config || {},
        options: {
          ...this.config.options || {},
          ...commandConfig.config?.options || {}
        }
      };
      const commandMetadata = commandConfig.metadata || {};
      this.metadata = {
        ...this.metadata,
        ...commandMetadata,
        options: {
          ...this.metadata.options || {},
          ...commandMetadata.options || {}
        }
      };
    }
    if (globalValues.help) {
      this.print({ message: this.getHelp(commandName) });
      return;
    }
    if (!commandConfig && globalPositionals.length === 0 && __privateGet(this, _rootHandlers).length > 0) {
      commandConfig = { handlers: __privateGet(this, _rootHandlers) };
    }
    if (!commandConfig) {
      if (globalPositionals.length > 0) {
        this.print({
          message: `Error: Unknown command "${globalPositionals.join(" ")}"
`,
          style: "red",
          level: "error"
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
        tokens: this.config.tokens
      });
      this.scriptArgs.positionals = this.scriptArgs.positionals.slice(positionalsConsumed);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.print({ message: `Parse Error: ${message}
`, style: "red", level: "error" });
      this.print({ message: this.getHelp(commandName) });
      process.exit(1);
    }
    if (commandConfig?.handlers && commandConfig.handlers.length > 0) {
      let handlerIndex = 0;
      const executeNext = () => {
        if (handlerIndex < commandConfig.handlers.length) {
          const handler = commandConfig.handlers[handlerIndex];
          handlerIndex++;
          try {
            handler(this, executeNext);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.print({ message: `Execution Error: ${message}
`, style: "red", level: "error" });
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
};
_commands = new WeakMap();
_rootHandlers = new WeakMap();
export {
  Tako
};
