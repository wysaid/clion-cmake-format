# Changelog - @cc-format/shell

## 1.5.0 (Initial Release)

- Shell script formatting with hybrid mode (local shfmt + WASM fallback)
- Support for POSIX Shell, Bash, Zsh, mksh, and Bats
- Configuration options matching shfmt flags: indent, binaryNextLine, caseIndent, spaceRedirects, keepPadding, functionNextLine, variant
- Built-in WASM formatter via sh-syntax (zero external dependencies)
- Optional local shfmt binary support for native performance
