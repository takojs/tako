# Why Tako?

In a world of powerful CLI tools, why build another one? For JavaScript beginners looking to create their first command-line interface (CLI) or experienced developers seeking a streamlined solution, Tako 🐙 offers a refreshing approach.

Tako was born from a simple desire: to create a CLI framework that is **delightfully simple, truly type-safe, and built from the ground up for the modern TypeScript ecosystem.** We believe that building command-line tools should be an enjoyable experience, not a battle with type definitions or complex APIs.

## Fulfilling the Need for a Modern, Zero-Dependency CLI

The quest for a truly lean and controlled CLI framework is a shared motivation within the JavaScript ecosystem, and Tako is built to answer that call. Discussions, such as those highlighted in the Hono.js CLI project ([honojs/cli/issues/42](https://github.com/honojs/cli/issues/42)), reveal a clear community need for a dedicated, dependency-free CLI toolkit. This toolkit should leverage cross-runtime primitives (fundamental argument parsing functionalities) like `node:util.parseArgs` to offer a consistent API across various runtimes including Node.js, Deno, and Bun.

Such a versatile and independent library, with its minimal footprint and complete control, is envisioned as ideal for building advanced CLI tools, particularly innovative applications like AI coding agents.

This approach makes it suitable for adoption by projects like Hono CLI, even if developed outside their immediate ecosystem.

Tako is precisely this library. It is engineered from the ground up to be a **zero-dependency**, cross-runtime CLI framework that provides:

- **Unified API**: Consistent experience across Node.js, Deno, Bun, and other JavaScript runtimes.
- **Minimal Footprint**: Ensures your CLIs remain lightweight and fast, free from unnecessary bloat.
- **Full Control**: Empowers you to dictate your CLI's behavior without external constraints.
- **Future-Proofing**: Mitigates the risk of unexpected dependency changes.
- **Advanced Use Cases**: Ideal for sophisticated tools like AI coding agents, prioritizing efficiency, control, and cross-runtime compatibility.

Tako embodies the philosophy that a CLI framework should be a foundational, stable, and unobtrusive component, empowering developers to build powerful tools with confidence, fulfilling a clear need identified by the community.

## A Focus on Developer Bliss

`Tako` is not just about features; it's about the developer experience.

### Truly Type-Safe, from Start to Finish

Many libraries add TypeScript support as an afterthought. `Tako` is **TypeScript-native**. This means:

- **Effortless Type Inference**: Define your commands, and `Tako` infers the types for your arguments and options automatically. No more manual type casting or wrestling with `@types` packages.
- **Rock-Solid Validation**: With a type-first foundation, integrating with validation libraries like Zod is a natural fit, ensuring your CLI is robust and error-resistant.
- **Smarter IDEs**: Enjoy superior autocompletion, inline documentation, and refactoring support that just works.

### Elegant Simplicity

`Tako` emphasizes an even more **minimalist and unopinionated API**. We provide the essentials to build powerful CLIs without locking you into a rigid structure. You get:

- **Explicit Control**: Fine-grained control over parsing and execution flow.
- **Middleware-style Architecture**: A simple yet powerful handler system, similar to those in web frameworks, that lets you compose command logic elegantly.

```javascript
import { Tako } from "@takojs/tako";

const tako = new Tako();

tako.cli({}, (c) => c.print({ message: crypto.randomUUID() }));
```

In short, `Tako` is for developers who love TypeScript and want a CLI framework that, like an octopus, is **lightweight, cross-runtime, and elegantly powerful.**
