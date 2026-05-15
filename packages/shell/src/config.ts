/**
 * @cc-format/shell - Shell formatting configuration
 *
 * Defines configuration options that map to shfmt flags.
 * See: https://github.com/mvdan/sh/blob/master/cmd/shfmt/shfmt.1.scd
 */

/**
 * Shell language variant for parsing and formatting.
 */
export type ShellVariant = 'auto' | 'bash' | 'posix' | 'mksh' | 'bats';

/**
 * Shell formatting options.
 * These map directly to shfmt flags.
 */
export interface ShellFormatOptions {
    /**
     * Number of spaces for indentation. 0 means tabs (default).
     * Maps to shfmt `-i N`.
     */
    indent: number;

    /**
     * Binary operators (&&, ||, |) may start a line.
     * Maps to shfmt `-bn`.
     */
    binaryNextLine: boolean;

    /**
     * Switch case bodies are indented.
     * Maps to shfmt `-ci`.
     */
    caseIndent: boolean;

    /**
     * Redirect operators are followed by a space.
     * Maps to shfmt `-sr`.
     */
    spaceRedirects: boolean;

    /**
     * Keep column alignment padding.
     * Maps to shfmt `-kp`.
     */
    keepPadding: boolean;

    /**
     * Function opening brace on a separate line.
     * Maps to shfmt `-fn`.
     */
    functionNextLine: boolean;

    /**
     * Shell language variant.
     * Maps to shfmt `-ln <variant>`.
     */
    variant: ShellVariant;

    /**
     * Path to local shfmt binary. When set and available, the local binary
     * is preferred over the built-in WASM formatter.
     */
    shfmtPath: string;
}

/**
 * Default shell formatting options.
 */
export const DEFAULT_SHELL_OPTIONS: ShellFormatOptions = {
    indent: 0,
    binaryNextLine: false,
    caseIndent: false,
    spaceRedirects: false,
    keepPadding: false,
    functionNextLine: false,
    variant: 'auto',
    shfmtPath: '',
};

/**
 * Shell file extensions recognized by cc-format.
 */
export const SHELL_FILE_EXTENSIONS = ['.sh', '.bash', '.zsh', '.bats', '.ksh', '.mksh'];

/**
 * Check if a filename is a shell script based on extension.
 */
export function isShellFile(filename: string): boolean {
    const lower = filename.toLowerCase();
    return SHELL_FILE_EXTENSIONS.some(ext => lower.endsWith(ext));
}

/**
 * Map ShellVariant to sh-syntax LangVariant code.
 * Values from sh-syntax: LangBash=0, LangPOSIX=1, LangMirBSDKorn=2, LangBats=3, LangAuto=4
 */
export function variantToLangCode(variant: ShellVariant): number {
    switch (variant) {
        case 'bash': return 0;
        case 'posix': return 1;
        case 'mksh': return 2;
        case 'bats': return 3;
        case 'auto': return 4;
        default: return 4;
    }
}
