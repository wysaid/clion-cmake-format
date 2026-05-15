# @cc-format/shell

Shell script formatting engine for [cc-format](https://github.com/wysaid/cc-format).

## Features

- **Hybrid formatting**: Prefers local `shfmt` binary when available, falls back to built-in WASM
- **Zero external dependencies**: Works out of the box with built-in WASM formatter
- **Full shfmt compatibility**: All formatting options map directly to shfmt flags
- **Language support**: POSIX Shell, Bash, Zsh, mksh, Bats

## Installation

```bash
npm install @cc-format/shell
```

## Usage

```typescript
import { formatShell } from '@cc-format/shell';

// Basic usage (uses WASM formatter by default)
const formatted = await formatShell('echo "hello world"');

// With options
const formatted = await formatShell(script, {
    indent: 4,           // 4 spaces (0 = tabs)
    binaryNextLine: true, // && and || may start a line
    caseIndent: true,     // indent case bodies
    variant: 'bash',      // language variant
});

// Prefer local shfmt if available
const formatted = await formatShell(script, {
    shfmtPath: '/usr/local/bin/shfmt',
    indent: 2,
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `indent` | `number` | `0` | Indentation spaces (0 = tabs) |
| `binaryNextLine` | `boolean` | `false` | Binary ops may start a line (`-bn`) |
| `caseIndent` | `boolean` | `false` | Indent switch case bodies (`-ci`) |
| `spaceRedirects` | `boolean` | `false` | Space after redirect operators (`-sr`) |
| `keepPadding` | `boolean` | `false` | Keep column alignment (`-kp`) |
| `functionNextLine` | `boolean` | `false` | Function brace on next line (`-fn`) |
| `variant` | `string` | `'auto'` | Language: `auto`, `bash`, `posix`, `mksh`, `bats` |
| `shfmtPath` | `string` | `''` | Path to local shfmt binary |

## License

MIT
