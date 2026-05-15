/**
 * @cc-format/shell - Shell script formatting engine
 *
 * Provides shell script formatting using a hybrid approach:
 * - Prefers a local shfmt binary when available (faster, native)
 * - Falls back to built-in WASM formatter (zero external dependencies)
 *
 * Supports POSIX Shell, Bash, Zsh, mksh, and Bats.
 */

export { formatShell, clearShfmtCache } from './formatter';
export { formatWithShfmt, isShfmtAvailable, buildShfmtArgs } from './shfmt';
export { formatWithWasm } from './wasm';
export type { ShellFormatOptions, ShellVariant } from './config';
export {
    DEFAULT_SHELL_OPTIONS,
    SHELL_FILE_EXTENSIONS,
    isShellFile,
    variantToLangCode,
} from './config';
