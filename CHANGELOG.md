# Changelog

All notable changes to the CLion CMake Format extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2] - 2025-12-16

### Changed

- **Extension name consistency** — Standardized to "CLion CMake Format" (not "Formatter") across all documentation and code
- **README restructuring** — Moved development content to dedicated `CONTRIBUTING.md` (English + Chinese)
- **Enhanced marketplace presentation** — Improved "Why This Extension?" section with clear value propositions
- **SEO optimization** — Refined keywords from 26 to 21 (more focused, removed redundant terms)
- **Zero-dependency messaging** — Emphasized "no Python, no external tools required" upfront in descriptions

### Added

- **Contributing guides** — New `CONTRIBUTING.md` and `CONTRIBUTING.zh-CN.md` with development setup, testing guidelines, and PR process
- **Complete configuration template** — Sample `.cc-format.jsonc` with all 22 options for easy project setup
- **Downloads badge** — Added VS Code Marketplace downloads badge to README
- **Team-recommended settings** — Example configuration for teams in README
- **Tips & Best Practices** — New section explaining formatting behavior and differences from CLion

### Fixed

- **Configuration count** — Updated documentation to correctly state 22 configuration options (was incorrectly 21 in some places)
- **Corrupted emoji characters** — Fixed broken emoji in README headings (Quick Start, Additional Resources, Full Configuration Reference)
- **Markdown formatting** — Converted bold emphasis to proper headings (MD036), removed blank lines inside blockquotes (MD028)
- **Schema validation** — Aligned `maxBlankLines` maximum (10→20) and `continuationIndentSize` minimum (0→1) with actual validation logic

### Documentation

- **English README** — Complete restructure with better organization and marketplace focus
- **Chinese README** — Synchronized with English version, maintaining consistency
- **Package descriptions** — Updated `package.nls.json` and `package.nls.zh-cn.json` with zero-dependency emphasis
- **Keywords optimization** — Added valuable terms: `cmake-format`, `gersemi`, `zero dependencies`, `code quality`, `auto-format`

## [1.2.1] - 2025-12-14

### Fixed

- **CRLF line ending handling** — Fixed issue where files with CRLF line endings (Windows) would always show as needing formatting even when already well-formatted
- **Extension comparison logic** — Now normalizes line endings before comparing original and formatted content
- **Parser line ending normalization** — Fixed parser methods to convert CRLF to LF in multi-line arguments (quoted strings, bracket arguments, nested parentheses, bracket comments)
- **Cross-platform formatting consistency** — Formatter now always outputs LF line endings (Unix standard) regardless of input, ensuring consistent behavior across platforms

### Added

- **CRLF tests** — Added 29 comprehensive test cases for CRLF line ending handling (Windows platform only)
- **Line ending normalization tests** — Verifies correct handling of both LF and CRLF inputs

## [1.2.0] - 2025-12-13

- New logo.

## [1.1.0] - 2025-12-13

- Show tips when formatting files.

## [1.0.1] - 2025-12-13

- Add logo.

## [1.0.0] - 2025-12-12

🎉 **First stable release!**

### Features

#### Core Formatting

- **CLion-compatible formatting** — Precisely replicates JetBrains CLion's CMake formatting behavior
- **Command case transformation** — Support for `unchanged`, `lowercase`, or `uppercase`
- **Smart indentation** — Configurable spaces or tabs per indentation level (1-16)
- **Intelligent line wrapping** — Automatically breaks long lines with proper continuation indent
- **Block structure support** — Correct indentation for `if/endif`, `function/endfunction`, `macro/endmacro`, `foreach/endforeach`, `while/endwhile`
- **Comment preservation** — Maintains inline and trailing comments in their original positions
- **Multi-line preservation** — Commands already split across lines maintain their structure

#### Configuration System

- **21 configuration options** — Comprehensive control over formatting behavior
- **Project-level configuration** — Support for `.cc-format.jsonc` files in project root
- **Configuration file watching** — Automatic reload when config files change
- **Configuration caching** — LRU cache for optimized performance
- **JSON Schema support** — IntelliSense for `.cc-format.jsonc` files

#### Commands

- **Format Document** — Format CMake files via keyboard shortcut or context menu
- **Create Default Configuration File** — Quickly set up project configuration with default values
- **Git root detection** — Smart detection of git root directory including submodule support

#### Developer Experience

- **Zero external dependencies** — Pure TypeScript implementation
- **Multi-language support** — English and Chinese interface
- **Comprehensive testing** — 126+ unit tests with idempotency validation
- **CI/CD** — GitHub Actions workflows for testing and releasing

### Configuration Options

#### Tab and Indentation

- `useTabs` — Use tabs instead of spaces (default: `false`)
- `tabSize` — Spaces per tab character (default: `4`, range: 1-16)
- `indentSize` — Spaces per indentation level (default: `4`, range: 1-16)
- `continuationIndentSize` — Additional indentation for continued lines (default: `4`, range: 1-16)
- `keepIndentOnEmptyLines` — Preserve indentation on empty lines (default: `false`)

#### Spacing Before Parentheses

- `spaceBeforeCommandDefinitionParentheses` — For `function` and `macro` (default: `false`)
- `spaceBeforeCommandCallParentheses` — For regular commands (default: `false`)
- `spaceBeforeIfParentheses` — For `if` statements (default: `true`)
- `spaceBeforeForeachParentheses` — For `foreach` loops (default: `true`)
- `spaceBeforeWhileParentheses` — For `while` loops (default: `true`)

#### Spacing Inside Parentheses

- `spaceInsideCommandDefinitionParentheses` — For `function` and `macro` (default: `false`)
- `spaceInsideCommandCallParentheses` — For regular commands (default: `false`)
- `spaceInsideIfParentheses` — For `if` statements (default: `false`)
- `spaceInsideForeachParentheses` — For `foreach` loops (default: `false`)
- `spaceInsideWhileParentheses` — For `while` loops (default: `false`)

#### Line Wrapping and Alignment

- `lineLength` — Maximum line length (default: `0` = unlimited, minimum 30 for non-zero)
- `alignMultiLineArguments` — Align arguments vertically (default: `false`)
- `alignMultiLineParentheses` — Align closing parenthesis (default: `false`)
- `alignControlFlowParentheses` — Align control flow parentheses (default: `false`)

#### Other Options

- `commandCase` — Command case transformation (default: `"unchanged"`)
- `maxBlankLines` — Maximum consecutive blank lines (default: `2`, range: 0-20)
- `enableProjectConfig` — Enable `.cc-format.jsonc` files (default: `true`)

### Supported CMake Constructs

- Commands and function calls
- Quoted and bracket arguments
- Line and bracket comments
- Control flow: `if`/`elseif`/`else`/`endif`
- Functions: `function`/`endfunction`
- Macros: `macro`/`endmacro`
- Loops: `foreach`/`endforeach`, `while`/`endwhile`
- Nested blocks with proper indentation

### Test Coverage

- 126 unit tests covering parser, formatter, and configuration
- Idempotency tests ensuring `format(format(x)) == format(x)`
- 20 test files from CMake official repository (6,302 lines)
- 100% pass rate ✅

### Notes

- **Intentional difference from CLion**: `break` and `continue` commands follow the same spacing rules as their parent loop (`foreach`/`while`) for consistency.
