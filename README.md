# Tako

[![GitHub License](https://img.shields.io/github/license/takojs/tako)](https://github.com/takojs/tako/blob/main/LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/takojs/tako)](https://github.com/takojs/tako/releases)
[![npm](https://img.shields.io/npm/v/@takojs/tako)](https://www.npmjs.com/package/@takojs/tako)
[![JSR](https://jsr.io/badges/@takojs/tako)](https://jsr.io/@takojs/tako)

[Tako](https://takojs.github.io/) - **means octopus 🐙 in Japanese** - is a lightweight and easy-to-use CLI framework.

A CLI framework that works on any JavaScript runtime: Node.js, Deno, and Bun.

## Features

- **Cross-runtime**: Works seamlessly with Node.js, Deno, and Bun.
- **Type-safe by Design**: Built with TypeScript for excellent type inference and a great developer experience.
- **Automatic Help Generation**: Creates beautiful and informative help messages from your code.
- **Middleware Support**: Chain command handlers to create clean, modular logic.
- **Simple & Elegant API**: A minimal API that is easy to learn and a pleasure to use.
- **Lightweight**: Tiny and with zero dependencies.

## Motivation

Learn about the motivation behind this project in [motivation.md](motivation.md).

## Installation

Tako is available on npm and JSR, and can be installed using your preferred package manager or runtime.

```bash
npm install @takojs/tako
```

```bash
yarn add @takojs/tako
```

```bash
pnpm add @takojs/tako
```

```bash
deno add jsr:@takojs/tako
```

```bash
bun add @takojs/tako
```

## Usage

Get started quickly by checking out the examples below or opening a development environment instantly.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/takojs/tako)

You can find complete, runnable examples in the [`examples`](examples) directory.

### Root Handler

This example demonstrates how to define a root handler, which runs when no command is specified.

**Source:** [`examples/untitled-01.ts`](examples/untitled-01.ts)

**Run it:**

```bash
$ node examples/untitled-01.ts
919108f7-52d1-4320-9bac-f847db4148a8
```

### Basic Command

This example demonstrates how to define a simple command with options, including automatic help message generation from its metadata.

**Source:** [`examples/untitled-02.ts`](examples/untitled-02.ts)

**Run it:**

```bash
$ node examples/untitled-02.ts hello
Hello, World!

$ node examples/untitled-02.ts hello -n Tako
Hello, Tako!

$ node examples/untitled-02.ts -h
Usage: node untitled-02.ts [OPTIONS] COMMAND [ARGS]...

  Untitled

Options:
  -g, --gen docs  Generate documentation.
  -h, --help      Show help.
  -v, --version   Show version.

Commands:
  hello  Prints a greeting.
```

### Middleware

This example demonstrates how Tako supports a middleware pattern for chaining handlers, which is useful for tasks like authentication.

**Source:** [`examples/untitled-03.ts`](examples/untitled-03.ts)

**Run it:**

```bash
$ node examples/untitled-03.ts secret
Authentication failed!

$ node examples/untitled-03.ts secret -t dQw4w9WgXcQ
Authenticated!
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### Standard Schema

This example demonstrates custom validation using [Standard Schema](https://standardschema.dev/), a common interface for JavaScript/TypeScript libraries like [Zod](https://zod.dev/), [Valibot](https://valibot.dev/), and [ArkType](https://arktype.io/), with middleware and helper.

**Source:** [`examples/untitled-04.ts`](examples/untitled-04.ts)

**Run it:**

```bash
$ node examples/untitled-04.ts middleware
node

$ node examples/untitled-04.ts invalid-validation
Error: Validation failed.
[
  {
    "message": "Invalid string.",
    "path": []
  }
]
```

### Deno and JSR Usage

This example demonstrates a Deno-based root handler that imports Tako from the JSR registry.

**Source:** [`examples/jsr-untitled-01.ts`](examples/jsr-untitled-01.ts)

**Run it:**

```bash
$ deno --no-npm examples/jsr-untitled-01.ts
919108f7-52d1-4320-9bac-f847db4148a8
```

### Standard Schema with Deno

This example demonstrates Standard Schema validation with Valibot in a command specific to the Deno runtime.

**Source:** [`examples/jsr-untitled-02.ts`](examples/jsr-untitled-02.ts)

**Run it:**

```bash
$ deno --no-npm examples/jsr-untitled-02.ts runtime
deno

$ bash -c 'exec -a node deno --no-npm examples/jsr-untitled-02.ts runtime'
Error: Validation failed.
[
  {
    "kind": "schema",
    "type": "literal",
    "input": "node",
    "expected": "\"deno\"",
    "received": "\"node\"",
    "message": "Invalid type: Expected \"deno\" but received \"node\""
  }
]

  Try '-h, --help' for help.
```

### Deno HTTP Import

This example demonstrates a Deno-based root handler that imports Tako directly from GitHub via HTTP.

**Source:** [`examples/http-untitled-01.ts`](examples/http-untitled-01.ts)

**Run it:**

```bash
$ deno --no-npm examples/http-untitled-01.ts
919108f7-52d1-4320-9bac-f847db4148a8

$ deno https://raw.githubusercontent.com/takojs/tako/refs/heads/main/examples/http-untitled-01.ts
919108f7-52d1-4320-9bac-f847db4148a8
```

## API

### `new Tako()`

Creates a new `Tako` instance.

### `.command(name, args, ...handlers)`

Defines a command with one or more handlers (middleware).

- `name`: The name of the command.
- `args`: An object containing `config` and `metadata` for the command.
  - `args.config`: A `ParseArgsConfig` object defining the CLI configuration for this command.
  - `args.metadata`: An `ArgsMetadata` object providing help text and other metadata for the command and its options.
- `...handlers`: A sequence of handler functions. Each handler receives the `Tako` instance and a `next` function to call the next handler in the chain.
  - `handler(c, next)`

### `.cli(args, ...handlers)`

Initializes the CLI, parses arguments, and runs the corresponding command. This should be the last call in your script.

- `args`: An object containing global `config` and `metadata`.
- `...handlers`: Optional root handlers to be executed if no command is specified.

### `.print(args)`

Prints a message to the console.

- `args.message`: The message to print.
- `args.style`: Text style (e.g., `red`, `bold`).
- `args.level`: The console level (e.g., `warn`, `error`). Defaults to `log`.
- `args.value`: A boolean value, primarily used with the `assert` level to determine if an assertion passes or fails.

### `.fail(err)`

Handles errors by printing a standardized, formatted error message to the console and terminating the process with an exit code of `1`. This ensures consistent error handling across the CLI. The method's return type is `never`, as it always exits the application.

- `err`: The error to handle. It can be an `Error` object, a string, or any other type. The error message will be extracted and displayed.

### `.argv`

A **readonly** property that returns an array containing the command-line arguments passed when the process was launched. The first element is the path to the executable, the second element is the path to the script being executed, and the remaining elements are the additional command-line arguments.

### `.argv0`

A **readonly** property that stores a copy of the original value of `argv[0]` passed when the process started. This is useful for cases where the process is launched in a way that might alter the `argv[0]` value, such as with a custom process name.

### `.scriptArgs`

A **readonly** property that provides access to the full parsed command-line arguments, including raw tokens if enabled. Internally managed as a private property, it exposes a `ParsedResults` object with three properties:

- `values`: An object containing the parsed option values (e.g., `{ name: "Tako" }`).
- `positionals`: An array of positional arguments (e.g., `["hello"]`).
- `tokens?`: An array of tokens representing the parsed command-line arguments. This property is available only if the `tokens` option in `ParseArgsConfig` is set to `true`.

### `.args`

A mutable property for passing data between middleware handlers. Unlike the readonly `.scriptArgs`, `.args` can be modified by handlers to share contextual information throughout a command's execution.

### `.config`

A **readonly** property that provides access to the currently active command's configuration. Internally managed as a private property, this `ParseArgsConfig` object can be useful for handlers that need to dynamically inspect the command's configuration.

- `args?`: An array of arguments to parse.
- `options?`: Definitions for command-line options.
  - `type`: The type of the option's value.
  - `short?`: A single-character alias for the option.
  - `default?`: The default value for the option.
  - `multiple?`: If `true`, the option can be specified multiple times, resulting in an array of values.
- `strict?`: If `false`, allows unknown arguments.
- `allowPositionals?`: If `false`, throws an error for positional arguments.
- `allowNegative?`: If `true`, allows options like `--no-foo`.
- `tokens?`: If `true`, populates a `tokens` array in the parsed results.

### `.metadata`

A property that holds the currently active command's `ArgsMetadata` object.

- `cliExit?`: If `false`, errors are thrown instead of exiting the process.
- `cliName?`: The name of the CLI used in help messages.
- `version?`: The CLI's version string.
- `help?`: The help description for the command.
- `placeholder?`: A placeholder for positional arguments in the usage string.
- `required?`: If `true`, indicates that at least one positional argument is required.
- `options?`: Metadata for individual options.
  - `help?`: A help message for the individual option.
  - `placeholder?`: A placeholder for the option's value in help messages.
  - `required?`: If `true`, this specific option must be provided.

### `.genDocs()`

Returns the generated help messages for all commands as a single string.

### `.getHelp(target?)`

Returns the generated help message as a string.

### `.getVersion()`

Returns the CLI version string from the metadata.

### `.getRuntimeKey()`

Returns the current JavaScript runtime ("node", "deno", or "bun").

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

SPDX-License-Identifier: MIT
