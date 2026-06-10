# CLion CMake Format

[![CI](https://github.com/wysaid/clion-cmake-format/actions/workflows/ci.yml/badge.svg)](https://github.com/wysaid/clion-cmake-format/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue.svg)](https://marketplace.visualstudio.com/items?itemName=wysaid.clion-cmake-format)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/wysaid.clion-cmake-format)](https://marketplace.visualstudio.com/items?itemName=wysaid.clion-cmake-format)
[![npm](https://img.shields.io/npm/v/cc-format)](https://www.npmjs.com/package/cc-format)

**Professional CMake code formatting** — Format your `CMakeLists.txt` and `*.cmake` files with JetBrains CLion's proven formatting style. **Zero external dependencies** — no Python, cmake-format, or gersemi required. Pure TypeScript, lightning fast.

Available as:

- 🔌 **VS Code Extension** — [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=wysaid.clion-cmake-format)
- 💻 **CLI Tool** — [npm package](https://www.npmjs.com/package/cc-format)
- 📦 **Core Library** — [@cc-format/core](https://www.npmjs.com/package/@cc-format/core) for developers

> **Project Codename**: `cc-format` (CLion CMake Format)
> **Why choose this formatter?** Precision, configurability, and zero hassle. If you value clean, maintainable CMake scripts, this is for you.

English | [简体中文](README.zh-CN.md)

## 📦 Monorepo Structure

This project is organized as a **monorepo** containing three packages that work together to provide comprehensive CMake formatting solutions:

| Package | Description | npm Package |
|---------|-------------|-------------|
| **[@cc-format/core](packages/core/)** | Core formatting engine with zero dependencies. Pure TypeScript parser and formatter that can be integrated into any JavaScript/TypeScript project | [@cc-format/core](https://www.npmjs.com/package/@cc-format/core) |
| **[cc-format](packages/cli/)** | Command-line interface tool for terminal usage, CI/CD pipelines, and pre-commit hooks | [cc-format](https://www.npmjs.com/package/cc-format) |
| **[clion-cmake-format](packages/vscode/)** | VS Code extension providing seamless editor integration with format-on-save support | [Marketplace](https://marketplace.visualstudio.com/items?itemName=wysaid.clion-cmake-format) |

All three packages share the same core formatting engine, ensuring **consistent results** across different environments. Whether you format files in your editor, via command line, or programmatically in your own tools, the output is identical.

## ✨ Why This Extension?

### 🎯 CLion-Quality Formatting

Precisely replicates JetBrains CLion's CMake formatting — trusted by millions of professional developers worldwide. Get consistent, readable code across your entire team.

### ⚡ Zero Setup Required

No Python installation. No pip packages. No configuration hell. Just install and format — it works out of the box.

### 🔧 Fully Customizable

23 configuration options give you complete control:

- **Indentation**: tabs, spaces, size, continuation
- **Spacing**: before/inside parentheses for all command types
- **Line Wrapping**: custom length, alignment rules
- **Command Case**: lowercase, UPPERCASE, or unchanged
- **And more**: blank lines, project configs, auto-watch

### 📁 Project-Level Config Files

Use `.cc-format.jsonc` files to share formatting rules across your team. Supports automatic file watching — changes apply instantly.

### 🖼️ Visual Configuration Editor

Edit `.cc-format.jsonc` with a friendly visual editor inside VS Code.

[![Visual configuration editor screenshot](images/config-editor.png)](images/config-editor.png)

### ✅ Battle-Tested Quality

- **126+ unit tests** ensuring rock-solid reliability
- **Idempotency validated** — formatting twice gives identical results
- **CMake official tests** — 20 real-world files from CMake's own repository (6,302 lines)
- **100% pass rate** ✅

### 🚀 Performance

Pure TypeScript implementation. No spawning external processes. Fast, reliable, and efficient.

## 🚀 Quick Start

### 1️⃣ Install

#### Option A: From VS Code Marketplace (Recommended)

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac)
3. Search for **"CLion CMake Format"**
4. Click **Install**

### Option B: From VSIX File

1. Download `.vsix` from [Releases](https://github.com/wysaid/clion-cmake-format/releases)
2. Open Extensions in VS Code (`Ctrl+Shift+X`)
3. Click `...` → **Install from VSIX...**

### 2️⃣ Format Your Code

### Method 1: Keyboard Shortcut

- Open any `CMakeLists.txt` or `*.cmake` file
- Press `Shift+Alt+F` (Windows/Linux) or `Shift+Option+F` (Mac)

### Method 2: Context Menu

- Right-click in the editor → **Format Document**

### Method 3: Format on Save (Recommended)

Add to your VS Code `settings.json`:

```json
{
  "[cmake]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "wysaid.clion-cmake-format"
  }
}
```

### 3️⃣ (Optional) Create Project Config

Share formatting rules with your team:

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run **"CLion CMake Format: Create Default Configuration File"**
3. Edit `.cc-format.jsonc` in your project root (or any parent directory)

Changes are applied automatically — no restart needed!

---

## 💻 CLI Tool (npm package)

The same formatting functionality is available as a command-line tool for CI/CD pipelines, pre-commit hooks, or direct terminal use.

### Installation

```bash
# Install globally
npm install -g cc-format

# Or use with npx (no installation)
npx cc-format --help
```

### Basic Usage

```bash
# Format a single file (output to stdout)
cc-format CMakeLists.txt

# Format and write back to file
cc-format -w CMakeLists.txt

# Format all CMake files in a directory
cc-format -w src/

# Check if files are formatted (for CI)
cc-format --check CMakeLists.txt

# Format from stdin
echo 'project(Test)' | cc-format --stdin
```

### CLI Options

| Option | Description |
|--------|-------------|
| `-w, --write` | Write formatted output back to files |
| `-c, --check` | Check if files are formatted (exit 1 if not) |
| `--stdin` | Read from stdin and write to stdout |
| `--no-project-config` | Ignore project-level `.cc-format.jsonc` files |
| `--config <path>` | Use a specific `.cc-format` config file (overrides automatic directory-tree search). Supports `~` and `${userHome}` expansion. Relative paths resolved from current working directory. If the file is missing, a warning is shown and defaults/global config are used (tree search is also skipped). |
| `--command-case <case>` | Set command case: `unchanged`, `lowercase`, `uppercase` |
| `--indent-size <size>` | Number of spaces for indentation |
| `--use-tabs` | Use tabs instead of spaces |
| `--line-length <length>` | Maximum line length (0 for unlimited) |
| `--init` | Create a `.cc-format.jsonc` config file in current directory |
| `--init-global` | Create a global config file |
| `--config-path` | Show path to global config file |

### Global Configuration

The CLI supports a global configuration file for user-wide settings:

```bash
# Show global config path
cc-format --config-path
# Output: ~/.config/cc-format/.cc-format.jsonc

# Create global config
cc-format --init-global
```

The global config file uses the same format as project config files. Settings priority:

1. CLI options (highest)
2. Explicit config file (`--config <path>` — if provided, replaces the tree search entirely)
3. Project config (`.cc-format.jsonc` — searched from file's directory up to filesystem root)
4. Global config (`~/.config/cc-format/.cc-format.jsonc`)
5. Default options (lowest)

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Check CMake formatting
  run: npx cc-format --check **/*.cmake CMakeLists.txt
```

```bash
# Pre-commit hook
#!/bin/sh
cc-format --check $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(cmake|CMakeLists\.txt)$') || exit 1
```

---

## 📋 Before & After Examples

### Example 1: Basic Formatting

**Before:**

```cmake
CMAKE_MINIMUM_REQUIRED(VERSION 3.10)
PROJECT(MyProject)
SET(SOURCES src/main.cpp src/utils.cpp src/parser.cpp src/formatter.cpp src/renderer.cpp)
IF(WIN32)
TARGET_LINK_LIBRARIES(myapp ws2_32)
ENDIF()
```

**After** (with `commandCase: "lowercase"`):

```cmake
cmake_minimum_required(VERSION 3.10)
project(MyProject)
set(SOURCES
    src/main.cpp
    src/utils.cpp
    src/parser.cpp
    src/formatter.cpp
    src/renderer.cpp)
if (WIN32)
    target_link_libraries(myapp ws2_32)
endif ()
```

### Example 2: Complex Projects

Works seamlessly with:

- ✅ Multi-line commands with arguments
- ✅ Nested `if`/`else`/`endif` blocks
- ✅ `foreach` and `while` loops
- ✅ Function and macro definitions
- ✅ Comments (inline and standalone)
- ✅ Quoted strings and escape sequences
- ✅ Generator expressions

## ⚙️ Configuration Options

Customize formatting behavior via:

1. **VS Code Settings** — Global or per-workspace
2. **Project Config File** — `.cc-format.jsonc` searched from the file's directory up to filesystem root (takes precedence)

### Popular Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `indentSize` | `4` | Spaces per indentation level (1-16) |
| `useTabs` | `false` | Use tabs instead of spaces |
| `commandCase` | `"unchanged"` | Command case: `unchanged` / `lowercase` / `uppercase`<br>⚠️ Module commands (e.g., `FetchContent_Declare`, `ExternalProject_Add`) always preserve their case |
| `lineLength` | `0` | Max line length (0 = unlimited, min 30 if set) |
| `maxBlankLines` | `2` | Maximum consecutive blank lines (0-20) |
| `maxTrailingBlankLines` | `1` | Maximum blank lines at end of file (>= 0, set a large number to keep all) |
| `spaceBeforeIfParentheses` | `true` | Space before `if ()` / `elseif ()` / `endif ()` |
| `spaceBeforeForeachParentheses` | `true` | Space before `foreach ()` / `endforeach ()` |
| `alignMultiLineArguments` | `false` | Align arguments vertically |
| `enableProjectConfig` | `true` | Enable reading `.cc-format.jsonc` files |
| `configFilePath` | `""` | Path to a specific `.cc-format` config file. Overrides automatic directory-tree search. Supports `${workspaceFolder}`, `${userHome}`, and `~`. Empty = disabled. |

### Sample Project Config

Create `.cc-format.jsonc` in your project root (or any parent directory to share across projects):

```jsonc
// https://github.com/wysaid/clion-cmake-format
{
    // Tab and Indentation
    "useTabs": false,
    "tabSize": 4,
    "indentSize": 4,
    "continuationIndentSize": 8,
    "keepIndentOnEmptyLines": false,

    // Spacing Before Parentheses
    "spaceBeforeCommandDefinitionParentheses": false,
    "spaceBeforeCommandCallParentheses": false,
    "spaceBeforeIfParentheses": true,
    "spaceBeforeForeachParentheses": true,
    "spaceBeforeWhileParentheses": true,

    // Spacing Inside Parentheses
    "spaceInsideCommandDefinitionParentheses": false,
    "spaceInsideCommandCallParentheses": false,
    "spaceInsideIfParentheses": false,
    "spaceInsideForeachParentheses": false,
    "spaceInsideWhileParentheses": false,

    // Blank Lines
    "maxBlankLines": 2,
    "maxTrailingBlankLines": 1,

    // Command Case: "unchanged", "lowercase", or "uppercase"
    "commandCase": "unchanged",

    // Line Wrapping and Alignment
    "lineLength": 0,
    "alignMultiLineArguments": false,
    "alignMultiLineParentheses": false,
    "alignControlFlowParentheses": false
}
```

📖 **[View all 23 configuration options →](https://github.com/wysaid/clion-cmake-format#full-configuration-reference)**

## 📚 Additional Resources

- 📖 **[Complete Configuration Reference](#full-configuration-reference)** — All 23 options explained
- 🛠️ **[Contributing Guide](CONTRIBUTING.md)** — Development setup, testing, and contribution guidelines
- 📝 **[Changelog](CHANGELOG.md)** — Release history and updates
- 🐛 **[Report Issues](https://github.com/wysaid/clion-cmake-format/issues)** — Bug reports and feature requests
- 💬 **[Discussions](https://github.com/wysaid/clion-cmake-format/discussions)** — Questions and community support

---

## 📖 Full Configuration Reference

> **⚠️ Note**: Version 1.3.0+ changed the default `continuationIndentSize` from 4 to 8 to match CLion's default. If you prefer the previous default, add `"continuationIndentSize": 4` to your `.cc-format.jsonc` file.

### Tab and Indentation

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `useTabs` | boolean | `false` | Use tabs instead of spaces |
| `tabSize` | number | `4` | Spaces per tab (1-16) |
| `indentSize` | number | `4` | Spaces per indent level (1-16) |
| `continuationIndentSize` | number | `8` | Continuation line indent (1-16) ⚠️ _Changed from 4 in v1.3.0_ |
| `keepIndentOnEmptyLines` | boolean | `false` | Preserve indent on empty lines |

### Spacing Before Parentheses

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `spaceBeforeCommandDefinitionParentheses` | boolean | `false` | `function()` / `macro()` |
| `spaceBeforeCommandCallParentheses` | boolean | `false` | Regular commands |
| `spaceBeforeIfParentheses` | boolean | `true` | `if()` / `elseif()` / `else()` / `endif()` |
| `spaceBeforeForeachParentheses` | boolean | `true` | `foreach()` / `endforeach()` |
| `spaceBeforeWhileParentheses` | boolean | `true` | `while()` / `endwhile()` |

### Spacing Inside Parentheses

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `spaceInsideCommandDefinitionParentheses` | boolean | `false` | `function( )` / `macro( )` |
| `spaceInsideCommandCallParentheses` | boolean | `false` | Regular commands |
| `spaceInsideIfParentheses` | boolean | `false` | `if( )` statements |
| `spaceInsideForeachParentheses` | boolean | `false` | `foreach( )` loops |
| `spaceInsideWhileParentheses` | boolean | `false` | `while( )` loops |

### Line Wrapping and Alignment

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `lineLength` | number | `0` | Max line length (0 = unlimited, min 30 for non-zero) |
| `alignMultiLineArguments` | boolean | `false` | Align arguments vertically |
| `alignMultiLineParentheses` | boolean | `false` | Align closing parenthesis |
| `alignControlFlowParentheses` | boolean | `false` | Align control flow parentheses |

### Other Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `commandCase` | string | `"unchanged"` | `unchanged`, `lowercase`, or `uppercase` |
| `maxBlankLines` | number | `2` | Max consecutive blank lines (0-20) |
| `maxTrailingBlankLines` | number | `1` | Max blank lines at end of file (>= 0, set large number to keep all) |
| `enableProjectConfig` | boolean | `true` | Enable `.cc-format.jsonc` files |
| `configFilePath` | string | `""` | Path to a specific `.cc-format` config file (overrides tree search). Supports `${workspaceFolder}`, `${userHome}`, `~`. |

### Configuration Validation

Configuration values are automatically validated to prevent common mistakes while remaining permissive for diverse coding styles:

#### Automatic Corrections

When an invalid value is detected, the formatter automatically corrects it to the nearest valid value and displays a warning message. This ensures formatting always succeeds even with incorrect configuration.

**Validation Rules:**

- **Indent sizes** (`tabSize`, `indentSize`, `continuationIndentSize`): Valid range 1-16
  - Supports both compact (1-2 spaces) and spacious (8-16 spaces) coding styles
  - Values outside this range are clamped to nearest boundary

- **Line length** (`lineLength`): 0 (unlimited) or ≥30
  - 0 means unlimited line length (no wrapping)
  - Non-zero values below 30 are set to 30 to prevent excessive wrapping
  - Ensures even basic CMake commands remain readable

- **Blank lines** (`maxBlankLines`): Valid range 0-20
  - Prevents accidental excessive whitespace
  - More than 20 consecutive blank lines is rarely intentional

- **Trailing blank lines** (`maxTrailingBlankLines`): ≥0
  - Set to a large number (e.g., 1000) to keep all trailing blank lines

**Example Warning Messages:**

```text
tabSize value 0 is out of range [1, 16]. Using minimum value 1.
lineLength value 10 is too small. Using minimum value 30.
maxBlankLines value 25 is out of range [0, 20]. Using maximum value 20.
```

---

## 💡 Tips & Best Practices

### Formatting Behavior

- **Idempotent**: Formatting twice produces identical output
- **Comment Preservation**: All comments (inline and standalone) are preserved
- **Whitespace Handling**: Smart whitespace normalization without data loss
- **Line Wrapping**: Intelligent line breaking respects `lineLength` setting

### Recommended Settings for Teams

```jsonc
{
    "commandCase": "lowercase",           // Modern CMake convention
    "indentSize": 4,                      // Standard indentation
    "lineLength": 120,                    // Readable line length
    "maxBlankLines": 1,                   // Compact formatting
    "spaceBeforeIfParentheses": true,     // Clear control flow
    "spaceBeforeForeachParentheses": true,
    "spaceBeforeWhileParentheses": true
}
```

### Differences from CLion

This extension aims for CLion compatibility with **two intentional enhancements**:

#### 1. Module Command Case Preservation

**Module commands preserve their canonical PascalCase naming**, regardless of the `commandCase` setting:

```cmake
# With commandCase: "lowercase"
include(FetchContent)                    # Standard command → lowercase
FetchContent_Declare(mylib)              # Module command → case preserved
FetchContent_MakeAvailable(mylib)        # Module command → case preserved

include(ExternalProject)                 # Standard command → lowercase
ExternalProject_Add(somelib)             # Module command → case preserved

include(CheckCXXSourceCompiles)          # Standard command → lowercase
check_cxx_source_compiles(...)           # Lowercase by design → unchanged
```

**Common module commands that preserve case**:

- `FetchContent_*` (Declare, MakeAvailable, Populate, GetProperties)
- `ExternalProject_*` (Add, Add_Step, Add_StepTargets)
- `GTest_*` (Add_Tests), `GMock_*` (Add_Tests)
- `Qt5_*`, `Qt6_*` (Use_Modules, Add_Resources)
- `CPM_*` (AddPackage)
- And other PascalCase_PascalCase patterns from CMake modules

**Note**: Some modules like `CheckCXXSourceCompiles` provide lowercase commands (e.g., `check_cxx_source_compiles`) which do not match the PascalCase_PascalCase pattern and are treated as standard commands subject to `commandCase` transformation.

**Why?** CMake module authors use specific casing (e.g., `FetchContent_Declare`) to distinguish module commands from standard commands. CLion forces all commands to match the `commandCase` setting, which can make module commands less recognizable. This tool preserves their intended casing for better readability and consistency with CMake documentation.

#### 2. Loop Control Commands

**Loop Control Commands** (`break`/`continue`) follow their parent loop's spacing rules, providing more consistent formatting:

```cmake
# With spaceBeforeForeachParentheses: true
foreach (item IN LISTS items)
    if (condition)
        break ()      # Consistent with foreach ()
    endif ()
endforeach ()
```

_CLion ignores spacing rules for `break`/`continue`, which can feel inconsistent._

---

## 🛠️ For Developers

Want to contribute or customize the extension? Check out our **[Contributing Guide](CONTRIBUTING.md)** for:

- 🔧 Development environment setup
- 📜 Available npm scripts
- 📂 Project structure overview
- 🐛 Debugging instructions
- ✅ Testing guidelines
- 📝 Code style and PR guidelines

**Quick Start for Development:**

```bash
git clone https://github.com/wysaid/clion-cmake-format.git
cd clion-cmake-format
pnpm install && pnpm run compile && pnpm run test:unit
```

---

## 📜 License

[MIT License](LICENSE) © [wysaid](https://github.com/wysaid)

Free for personal and commercial use.

---

## 🙏 Acknowledgments

- **[JetBrains CLion](https://www.jetbrains.com/clion/)** — Inspiration for formatting behavior
- **[cmake_format](https://github.com/cheshirekow/cmake_format)** — Configuration options reference
- **[ege-vscode-plugin](https://github.com/x-ege/ege-vscode-plugin)** — VS Code extension development practices

---

## 🌟 Support This Project

If this extension helped you, consider:

- ⭐ **[Star on GitHub](https://github.com/wysaid/clion-cmake-format)**
- ✍️ **[Leave a review](https://marketplace.visualstudio.com/items?itemName=wysaid.clion-cmake-format&ssr=false#review-details)**
- 🐛 **[Report issues](https://github.com/wysaid/clion-cmake-format/issues)**
- 💬 **[Share feedback](https://github.com/wysaid/clion-cmake-format/discussions)**

Thank you! 🙌
