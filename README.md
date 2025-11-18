# Tako

[![GitHub License](https://img.shields.io/github/license/takojs/tako)](https://github.com/takojs/tako/blob/main/LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/takojs/tako)](https://github.com/takojs/tako/releases)
[![npm](https://img.shields.io/npm/v/@takojs/tako)](https://www.npmjs.com/package/@takojs/tako)
[![JSR](https://jsr.io/badges/@takojs/tako)](https://jsr.io/@takojs/tako)

Tako - **means octopus 🐙 in Japanese** - is a lightweight and easy-to-use CLI framework.

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

You can also define a handler that runs when no command is specified.

**Source:** [`examples/untitled-1.ts`](examples/untitled-1.ts)

**Run it:**

```bash
$ node examples/untitled-1.ts
919108f7-52d1-4320-9bac-f847db4148a8
```

### Basic Command

This example demonstrates how to define a simple command with options.

**Source:** [`examples/untitled-2.ts`](examples/untitled-2.ts)

**Run it:**

```bash
$ node examples/untitled-2.ts hello
Hello, World!

$ node examples/untitled-2.ts hello -n Tako
Hello, Tako!
```

### Middleware

Tako supports a middleware pattern for chaining handlers. This is useful for tasks like authentication.

**Source:** [`examples/untitled-3.ts`](examples/untitled-3.ts)

**Run it:**

```bash
$ node examples/untitled-3.ts secret
Authentication failed!

$ node examples/untitled-3.ts secret -t dQw4w9WgXcQ
Authenticated!
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### Automatic Help Generation

Help messages are automatically generated from your command and option metadata.

```bash
$ node examples/untitled-3.ts -h
```

```
Usage: node untitled-3.ts [COMMAND]

  Untitled

Options:
  -g, --gen docs  Generate documentation.
  -h, --help      Show help.
  -v, --version   Show version.

Commands:
  secret    A command that requires authentication.
```

## API

### `new Tako()`

Creates a new `Tako` instance.

### `.command(name, args, ...handlers)`

Defines a command with one or more handlers (middleware).

- `name`: The name of the command.
- `args`: An object containing `config` and `metadata` for the command.
  - `args.config`: An object defining the CLI config for this command.
  - `args.metadata`: An object providing descriptions for the command and its config.
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
- `args.level`: The console level (e.g., `log`, `error`). Defaults to `log`.
- `args.value`: A boolean value, primarily used with the `assert` level to determine if an assertion passes or fails.

### `.scriptArgs`

A property that holds the parsed command-line arguments. It has three properties:

- `values`: An object containing the parsed option values (e.g., `{ name: "Tako" }`).
- `positionals`: An array of positional arguments (e.g., `["hello"]`).
- `tokens`: An array of tokens representing the parsed command-line arguments.

### `.config`

A property that holds the currently active command's configuration. This object contains the `options` definitions and other parsing settings like `allowNegative` and `tokens`. It can be useful for handlers that need to dynamically inspect the command's configuration.

### `.metadata`

A property that holds the currently active command's metadata. This includes help text and any custom data attached to option definitions. This is useful for accessing custom values or descriptions within a handler.

### `.genDocs()`

Returns the generated help messages for all commands as a single string.

### `.getHelp()`

Returns the generated help message as a string.

### `.getVersion()`

Returns the CLI version string from the metadata.

### `.getRuntimeKey()`

Returns the current JavaScript runtime ("node", "deno", or "bun").

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

SPDX-License-Identifier: MIT
