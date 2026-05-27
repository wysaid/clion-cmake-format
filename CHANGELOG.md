# Changelog

All notable changes to the CLion CMake Format project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.5.1] - 2026-05-27

### Added

- **Parent directory config search** — Config file search now traverses up to the filesystem root, matching `.clang-format` behavior. A single `.cc-format.jsonc` in a parent directory can be shared across multiple projects. (fixes #34)

## [1.5.0] - 2026-01-11

### Added

- **[vscode] Visual Config Editor (dual-pane redesign)** — Reworked the VS Code visual editor with a modern dual-pane layout, tabbed CMake preview / JSONC source, and improved global settings mode.

### Fixed

- **[vscode] Webview hardening** — Improved CSP nonce generation, narrowed webview resource roots, validated/allowlisted option keys, and prevented cross-document update suppression.
- **[core] Formatting + config parsing** — Improved multiline alignment semantics to better match CLion, and added JSONC trailing comma support for `.cc-format.jsonc`.
- **[repo] Developer ergonomics on Windows** — Updated lint/test glob quoting to be Windows-friendly.

## [1.4.2] - 2026-01-08

### Fixed

- **Module command case preservation** — Commands following the `PascalCase_PascalCase` pattern (e.g., `FetchContent_Declare`, `ExternalProject_Add`) now preserve their original case regardless of `commandCase` setting, maintaining their canonical naming as defined by CMake module authors. Note that modules like `CheckCXXSourceCompiles` provide lowercase commands (e.g., `check_cxx_source_compiles`) which do not match the PascalCase pattern and are therefore treated as standard commands subject to `commandCase` transformation. This is an intentional difference from CLion, which forces all commands to match the `commandCase` setting. See [README § Differences from CLion](README.md#differences-from-clion) for details. (fixes #26)
- **Blank line preservation** — Fixed parser to correctly preserve blank lines containing whitespace characters, ensuring consistent formatting with CLion
- **Module command pattern detection** — Enhanced regex pattern to support module commands with digits in names (e.g., `Qt5_Use_Modules`, `Qt6_Add_Resources`)

### Added

- **Webpack bundling for VS Code extension** — Migrated to webpack for single-file bundling, reducing VSIX size from 148KB to 139KB and improving extension loading performance
- **Enhanced CLion comparison testing** — Improved testing infrastructure with isolated test directories and automatic cleanup of matched files
- **Comprehensive module command tests** — Added extensive test coverage for module command edge cases including GTest, GMock, Qt5/Qt6, CPM commands

### Changed

- **Publishing workflow** — Added unified version tag creation (`v{X}.{Y}.{Z}`) after publishing all packages with `--all` flag
- **Performance optimization** — Extracted module command pattern as constant to avoid regex recompilation on each check

## [1.4.1] - 2025-12-31

### 🎉 Major Changes

- **Monorepo restructuring** — Complete architectural overhaul into three packages for better modularity and reusability
- **Command-line interface** — New `cc-format` CLI tool for terminal and CI/CD workflows

### Added

#### Monorepo Architecture

- **`@cc-format/core` package** — Standalone formatting engine with programmatic API (published to npm)
- **`cc-format` CLI package** — Command-line tool with rich features (published to npm)
- **`clion-cmake-format` VS Code extension** — Uses core package as dependency
- **npm workspaces** — Proper package management for monorepo structure
- **TypeScript project references** — Correct build order and module resolution
- **Publishing scripts** — Automated scripts for publishing all packages

#### CLI Tool Features

- **`--stdin` mode** — Format CMake code from standard input (pipe support)
- **`--write` mode** — Format files in-place with automatic backup
- **`--check` mode** — Validate formatting without modifying files (CI-friendly)
- **`--init` command** — Generate `.cc-format.jsonc` configuration file interactively
- **`--config` option** — Specify custom configuration file path
- **`--no-color` option** — Disable colored output for CI environments
- **Exit codes** — Proper exit codes for scripting (0 = success, 1 = error, 2 = formatting needed)
- **Glob pattern support** — Format multiple files with patterns (e.g., `**/*.cmake`)
- **Cross-platform** — Tested on Ubuntu, Windows, and macOS

#### Documentation

- **Comprehensive API documentation** — Full API reference for `@cc-format/core` with examples
- **CLI usage guide** — Advanced usage examples including Docker, VS Code tasks, Makefile integration
- **Monorepo architecture guide** — Package structure and relationship explanation
- **Performance benchmarks** — CLI performance metrics and optimization tips
- **Migration guide** — Step-by-step guide for upgrading to monorepo structure
- **Cross-references** — Prominent links between CLI and VS Code extension READMEs
- **Enhanced test dataset docs** — Contribution guidelines with file naming conventions

#### CI/CD Enhancements

- **Core package testing** — Validate core exports and API surface
- **CLI cross-platform tests** — Automated testing on Ubuntu, Windows, macOS
- **Enhanced release workflow** — Comprehensive release notes including CLI and core changes
- **Manual trigger support** — Workflow dispatch for testing releases without publishing

### Changed

- **Project structure** — Migrated from flat structure to monorepo with `packages/` directory
- **Build system** — Switch from `ts-node` to `tsx` for Node.js 24 ESM compatibility
- **VS Code extension** — Now depends on `@cc-format/core@1.4.0` instead of local code
- **Test imports** — All tests updated to use `@cc-format/core` package imports
- **Configuration priority** — Clarified that project config (`.cc-format.jsonc`) takes precedence over VS Code settings

### Fixed

- **Package metadata** — Enhanced CLI package description and keywords (19 keywords for better npm discoverability)
- **Configuration documentation** — Improved validation rules with structured examples
- **Markdown syntax** — Fixed missing language specifiers in code blocks
- **README accuracy** — Corrected configuration priority order in VS Code extension docs

### Documentation

- **Root README** — Monorepo overview with package comparison table
- **Core package README** — Complete rewrite with API documentation (`formatCMake`, `parseOptions`, `loadConfig`, `validateContent`)
- **CLI package README** — Advanced usage examples and integration guides
- **VS Code extension README** — Enhanced troubleshooting and configuration guidance
- **Test datasets README** — Detailed contribution guidelines and best practices
- **Chinese documentation** — Synchronized all Chinese docs with English versions

### Breaking Changes

None. This is a backward-compatible release. Existing VS Code extension users will see no changes in functionality.

### Migration Notes

For VS Code extension users: No action required. The extension continues to work exactly as before.

For developers wanting to use the CLI tool or core library:

```bash
# Install CLI tool globally
npm install -g cc-format

# Or use in your project
npm install @cc-format/core
```

### Test Coverage

- 195 unit tests passing ✅
- CLI integration tests on 3 platforms ✅
- Idempotency tests on official CMake repository ✅

## [1.4.0] - 2025-12-23

### Added

- **Enhanced validator with detailed rule violation detection** — Validator now reports specific rule violations (indentation, spacing, blank lines, command case, trailing whitespace) instead of generic "formatted output differs" messages
- **`maxTrailingBlankLines` configuration option** — Control maximum blank lines at end of file (default: 1, range: >= 0). Set to a large number to preserve all trailing blank lines
- **`RuleViolationType` and `RuleViolation` types** — Structured violation information with rule type, line number, message, and original/expected content
- **`detectRuleViolations()` function** — Analyzes differences between original and formatted content to categorize violations by specific rules
- **`validateContent()` function** — Allows programmatic validation of CMake content without file I/O
- **Comprehensive test datasets** — 9 poorly-formatted samples and 5 configuration style templates (compact, lowercase, uppercase, tabs, two-space-indent)
- **Adversarial tests** — Validates formatting idempotency and ensures poorly-formatted files fail validation
- **Multi-config style validation** — Tests all well-formatted style directories automatically

### Fixed

- **Trailing newline preservation** — Formatter now respects input file's trailing newline preference (only adds trailing newline if input had one or if trailing blank lines are configured)
- **Integration test stability** — CLion comparison now tolerates trailing whitespace differences for better test reliability
- **Windows CLion detection** — Added JetBrains Toolbox installation path for Windows users

### Changed

- **Validator output** — `ValidationResult` now includes optional `violations` array with detailed rule violation information
- **Test organization** — Expanded validator tests from 31 lines to 350 lines with comprehensive rule coverage

## [1.3.0] - 2025-12-22

### ⚠️ Breaking Changes

- **Default `continuationIndentSize` changed from 4 to 8** — Aligns with CLion's default behavior and CMake community conventions. **Migration**: If you prefer the previous default, explicitly set `"continuationIndentSize": 4` in your `.cc-format.jsonc` configuration file.

### Added

- **CLion integration testing** — Complete test suite comparing plugin output against CLion's native formatter
- **CMake official idempotency tests** — Validates formatting stability on 20+ real-world CMake files from the official repository
- **Validation script** (`scripts/validate-with-clion.js`) — Batch-validates test datasets against CLion formatting standards
- **Validator module** (`src/validator.ts`) — Programmatic CMake file validation with directory traversal support
- **New VS Code tasks** — `test:integration`, `test:all`, and `test:clion` for comprehensive testing workflows
- **Enhanced test datasets** — 2,600+ lines of well-formatted test data matching CLion behavior
- **New edge case test** (`many-blank-lines.cmake`) — Tests `maxBlankLines` enforcement

### Changed

- **Test organization** — Separated integration tests (requiring CLion) from unit tests for better CI/CD flexibility
- **ESLint configuration** — Restructured to explicit schema with `extends`, `plugins`, `rules`, and `ignorePatterns` arrays
- **CMake official idempotency testing** — Integrated into Mocha test suite (removed standalone script)

### Fixed

- **Nested parentheses indentation** — Lines starting with `(` now use command indent; lines starting with `AND`, `OR`, etc. use continuation indent (matches CLion)
- **Inline comment alignment** — Preserves original spacing before inline comments to maintain alignment in comment blocks
- **Empty file handling** — Empty files return empty string (not `\n`); whitespace-only files preserve trailing blank lines
- **`maxBlankLines` enforcement** — Now properly limits consecutive blank lines within code blocks
- **Config resolution** — Uses `fs.realpathSync` for symlink-aware workspace root resolution

### Documentation

- **New guide** — `docs/CLION_INTEGRATION_TESTING.md` with setup instructions, usage examples, and troubleshooting
- **Updated contributing guides** — Added CLion testing section and clarified idempotency requirements
- **README improvements** — Fixed formatting tips reference and improved test command descriptions

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

- **23 configuration options** — Comprehensive control over formatting behavior
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
nds follow the same spacing rules as their parent loop (`foreach`/`while`) for consistency.
