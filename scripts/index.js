/*!
 * @takojs/tako
 *
 * SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Takuro Kitahara
 * SPDX-FileComment: Version 1.5.0
 */
var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

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
  cliExit: true,
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
import { basename } from "node:path";
import * as process from "node:process";
import * as util from "node:util";
var _scriptArgs, _config, _commands, _rootHandlers, _Tako_instances, mergeConfig_fn, mergeMetadata_fn;
var Tako = class {
  constructor() {
    __privateAdd(this, _Tako_instances);
    __publicField(this, "argv", process.argv);
    __publicField(this, "argv0", process.argv0);
    __privateAdd(this, _scriptArgs, { values: {}, positionals: [] });
    __publicField(this, "args", { values: {}, positionals: [] });
    __privateAdd(this, _config, { options: {} });
    __publicField(this, "metadata", { options: {} });
    __privateAdd(this, _commands, /* @__PURE__ */ new Map());
    __privateAdd(this, _rootHandlers, []);
  }
  get scriptArgs() {
    return __privateGet(this, _scriptArgs);
  }
  get config() {
    return __privateGet(this, _config);
  }
  print({ message, style, level, value } = {}) {
    const effectiveMessage = message ?? "";
    const effectiveLevel = level ?? "log";
    let outputArgs = Array.isArray(effectiveMessage) ? [...effectiveMessage] : [effectiveMessage];
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
  fail(err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(util.styleText("red", `Error: ${message}

  Try '-h, --help' for help.`));
    process.exit(1);
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
  getHelp(target) {
    const sections = [];
    const commandName = target?.split(" ").filter(Boolean).join(" ");
    let currentOptions = __privateGet(this, _config).options;
    let currentMetadataOptions = this.metadata.options;
    let currentCommandMetadata;
    if (commandName) {
      const commandDefinition = __privateGet(this, _commands).get(commandName);
      if (commandDefinition) {
        currentOptions = {
          ...__privateGet(this, _config).options,
          ...commandDefinition.config?.options || {}
        };
        currentMetadataOptions = {
          ...this.metadata.options,
          ...commandDefinition.metadata?.options || {}
        };
        currentCommandMetadata = commandDefinition.metadata;
      }
    }
    const usageParts = [];
    const optionDefinitions = Object.entries(currentOptions || {}).map(([name, opt]) => ({
      name,
      ...opt,
      ...currentMetadataOptions?.[name] || {}
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
    const commandNames = Array.from(__privateGet(this, _commands).keys());
    const hasSubCommands = commandName ? commandNames.some((name) => name.startsWith(`${commandName} `) && name !== commandName) : commandNames.length > 0;
    if (hasSubCommands) {
      usageParts.push("COMMAND", "[ARGS]...");
    } else {
      const meta = commandName ? currentCommandMetadata : this.metadata;
      if (meta?.placeholder) {
        usageParts.push(meta.placeholder);
      }
    }
    sections.push(usageParts.join(" "));
    const explanationLines = [];
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
    const fullOptions = optionDefinitions.map((opt) => {
      const shortOptionPart = opt.short ? `-${opt.short}, ` : "    ";
      let longOptionPart = `--${opt.name}`;
      if (opt.type === "boolean" && __privateGet(this, _config).allowNegative && opt.name !== "help" && opt.name !== "version") {
        longOptionPart = `--[no-]${opt.name}`;
      }
      const valuePlaceholder = opt.placeholder || "<value>";
      const placeholderPart = opt.type === "string" ? ` ${valuePlaceholder}` : "";
      const optionDefinition = `${shortOptionPart}${longOptionPart}${placeholderPart}`;
      return {
        ...opt,
        optionDefinition,
        length: optionDefinition.length
      };
    });
    if (fullOptions.length > 0) {
      const maxOptionLength = Math.max(0, ...fullOptions.map((opt) => opt.length));
      const targetWidth = maxOptionLength + 2;
      const lines = fullOptions.map((opt) => {
        const explanationParts = [];
        if (opt.help) {
          explanationParts.push(opt.help);
        }
        const detailsParts = [];
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
      sections.push(`Options:
${lines.join("\n")}`);
    }
    if (commandNames.length > 0) {
      const filteredCommandNames = commandName ? commandNames.filter((name) => name.startsWith(`${commandName} `) && name !== commandName) : commandNames.filter((name) => !name.includes(" "));
      if (filteredCommandNames.length > 0) {
        const commandsWithMeta = filteredCommandNames.map((name) => ({
          name,
          help: __privateGet(this, _commands).get(name)?.metadata?.help || ""
        }));
        const maxCommandLength = Math.max(0, ...commandsWithMeta.map((cmd) => cmd.name.length));
        const targetWidthForCommands = maxCommandLength + 2;
        const commandLines = commandsWithMeta.map((cmd) => {
          const displayCommandName = commandName ? cmd.name.substring(commandName.length + 1) : cmd.name;
          const requiredPadding = targetWidthForCommands - displayCommandName.length;
          const padding = " ".repeat(requiredPadding);
          return `  ${displayCommandName}${padding}${cmd.help}`;
        });
        sections.push(`Commands:
${commandLines.join("\n")}`);
      }
    }
    return sections.filter(Boolean).join("\n\n");
  }
  genDocs() {
    const docs = [];
    docs.push(this.getHelp());
    for (const commandName of __privateGet(this, _commands).keys()) {
      docs.push(this.getHelp(commandName));
    }
    return docs.join("\n\n");
  }
  command(name, { config, metadata } = {}, ...handlers) {
    const normalizedName = name?.split(" ").filter(Boolean).join(" ");
    const validHandlers = handlers.filter((h) => typeof h === "function");
    if (!normalizedName) {
      __privateGet(this, _rootHandlers).push(...validHandlers);
      return this;
    }
    const existingDefinition = __privateGet(this, _commands).get(normalizedName);
    const commandDefinition = {
      handlers: [...existingDefinition?.handlers || [], ...validHandlers],
      config: __privateMethod(this, _Tako_instances, mergeConfig_fn).call(this, existingDefinition?.config, config),
      metadata: __privateMethod(this, _Tako_instances, mergeMetadata_fn).call(this, existingDefinition?.metadata, metadata)
    };
    __privateGet(this, _commands).set(normalizedName, commandDefinition);
    return this;
  }
  async cli({ config, metadata } = {}, ...rootHandlers) {
    const validHandlers = rootHandlers.filter((h) => typeof h === "function");
    __privateSet(this, _config, __privateMethod(this, _Tako_instances, mergeConfig_fn).call(this, defaultConfig, config));
    this.metadata = __privateMethod(this, _Tako_instances, mergeMetadata_fn).call(this, defaultMetadata, metadata);
    __privateGet(this, _rootHandlers).push(...validHandlers);
    let globalParseOptions = __privateGet(this, _config).options;
    for (const commandDefinition2 of __privateGet(this, _commands).values()) {
      globalParseOptions = { ...globalParseOptions, ...commandDefinition2.config?.options || {} };
    }
    try {
      __privateSet(this, _scriptArgs, util.parseArgs({
        args: __privateGet(this, _config).args,
        options: globalParseOptions,
        strict: __privateGet(this, _config).strict,
        allowPositionals: __privateGet(this, _config).allowPositionals,
        allowNegative: __privateGet(this, _config).allowNegative,
        tokens: __privateGet(this, _config).tokens
      }));
    } catch (err) {
      if (this.metadata?.cliExit) {
        this.fail(err);
      }
      throw err;
    }
    const { positionals: globalPositionals, values: globalValues } = __privateGet(this, _scriptArgs);
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
    let bestCommandDefinition;
    let bestCommandName;
    let bestPositionalsConsumed = 0;
    if (globalPositionals.length > 0) {
      for (let i = globalPositionals.length; i > 0; i--) {
        const potentialCommandWithSpaces = globalPositionals.slice(0, i).join(" ");
        if (__privateGet(this, _commands).has(potentialCommandWithSpaces)) {
          bestCommandDefinition = __privateGet(this, _commands).get(potentialCommandWithSpaces);
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
      __privateSet(this, _config, __privateMethod(this, _Tako_instances, mergeConfig_fn).call(this, __privateGet(this, _config), commandDefinition.config));
      this.metadata = __privateMethod(this, _Tako_instances, mergeMetadata_fn).call(this, this.metadata, commandDefinition.metadata);
    }
    if (globalValues.help) {
      this.print({ message: this.getHelp(commandName) });
      return;
    }
    if (!commandDefinition && __privateGet(this, _rootHandlers).length > 0) {
      commandDefinition = { handlers: __privateGet(this, _rootHandlers) };
    }
    if (!commandDefinition) {
      if (globalPositionals.length > 0) {
        const msg = `Unknown command '${globalPositionals.join(" ")}'`;
        if (this.metadata?.cliExit) {
          this.fail(msg);
        }
        throw new Error(msg);
      }
      this.print({ message: this.getHelp() });
      return;
    }
    try {
      __privateSet(this, _scriptArgs, util.parseArgs({
        args: __privateGet(this, _config).args,
        options: __privateGet(this, _config).options,
        strict: __privateGet(this, _config).strict,
        allowPositionals: __privateGet(this, _config).allowPositionals,
        allowNegative: __privateGet(this, _config).allowNegative,
        tokens: __privateGet(this, _config).tokens
      }));
      __privateGet(this, _scriptArgs).positionals = __privateGet(this, _scriptArgs).positionals.slice(positionalsConsumed);
    } catch (err) {
      if (this.metadata?.cliExit) {
        this.fail(err);
      }
      throw err;
    }
    if (this.metadata.options) {
      for (const [name, meta] of Object.entries(this.metadata.options)) {
        if (meta.required && !(name in __privateGet(this, _scriptArgs).values)) {
          const opt = __privateGet(this, _config).options?.[name];
          const shortOptionPart = opt?.short ? `-${opt.short}, ` : "";
          let longOptionPart = `--${name}`;
          if (opt?.type === "boolean" && __privateGet(this, _config).allowNegative) {
            longOptionPart = `--[no-]${name}`;
          }
          const valuePlaceholder = meta.placeholder || "<value>";
          const placeholderPart = opt?.type === "string" ? ` ${valuePlaceholder}` : "";
          const optionDefinition = `${shortOptionPart}${longOptionPart}${placeholderPart}`;
          const msg = `Missing required option '${optionDefinition}'`;
          if (this.metadata?.cliExit) {
            this.fail(msg);
          }
          throw new Error(msg);
        }
      }
    }
    if (this.metadata.required) {
      if (__privateGet(this, _scriptArgs).positionals.length === 0) {
        const placeholderPart = this.metadata.placeholder ? ` '${this.metadata.placeholder}'` : "";
        const msg = `Missing required positional arguments${placeholderPart}`;
        if (this.metadata?.cliExit) {
          this.fail(msg);
        }
        throw new Error(msg);
      }
    }
    if (commandDefinition.handlers.length > 0) {
      let handlerIndex = 0;
      const next = async () => {
        if (handlerIndex < commandDefinition.handlers.length) {
          const handler = commandDefinition.handlers[handlerIndex];
          handlerIndex++;
          try {
            await handler(this, next);
          } catch (err) {
            if (this.metadata?.cliExit) {
              this.fail(err);
            }
            throw err;
          }
        }
      };
      await next();
    } else {
      this.print({ message: this.getHelp() });
    }
  }
};
_scriptArgs = new WeakMap();
_config = new WeakMap();
_commands = new WeakMap();
_rootHandlers = new WeakMap();
_Tako_instances = new WeakSet();
mergeConfig_fn = function(target, source) {
  return {
    ...target || {},
    ...source || {},
    options: { ...target?.options || {}, ...source?.options || {} }
  };
};
mergeMetadata_fn = function(target, source) {
  return {
    ...target || {},
    ...source || {},
    options: { ...target?.options || {}, ...source?.options || {} }
  };
};

// src/helpers.ts
var helpers_exports = {};
__export(helpers_exports, {
  v: () => v
});
async function v(input, ...schemas) {
  let lastResult;
  for (const schema of schemas) {
    let result = schema["~standard"].validate(input);
    if (result instanceof Promise) {
      result = await result;
    }
    if (result.issues) {
      throw new Error(`Validation failed.
${JSON.stringify(result.issues, null, 2)}`);
    }
    lastResult = result;
  }
  if (!lastResult) {
    throw new Error("No schema provided.");
  }
  return lastResult.value;
}

// src/middlewares.ts
var middlewares_exports = {};
__export(middlewares_exports, {
  v: () => v2
});
var targets = ["argv", "argv0", "scriptArgs", "args", "config", "metadata"];
function v2(target, ...schemas) {
  return async (c, next) => {
    if (!targets.includes(target)) {
      throw new Error(
        `Invalid validation target '${target}'.
Supported targets are '${targets.join("', '")}'.`
      );
    }
    for (const schema of schemas) {
      let result = schema["~standard"].validate(c[target]);
      if (result instanceof Promise) {
        result = await result;
      }
      if (result.issues) {
        throw new Error(`Validation failed.
${JSON.stringify(result.issues, null, 2)}`);
      }
    }
    return next();
  };
}
export {
  Tako,
  defaultConfig,
  defaultMetadata,
  helpers_exports as helper,
  middlewares_exports as middleware
};
