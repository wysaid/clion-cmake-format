/**
 * @cc-format/shell - WASM-based shell formatter
 *
 * Uses the sh-syntax npm package which bundles shfmt compiled to WASM
 * via TinyGo. This provides zero-dependency shell formatting.
 *
 * See: https://github.com/un-ts/sh-syntax
 */

import type { ShOptions, LangVariant } from 'sh-syntax';
import { ShellFormatOptions, variantToLangCode } from './config';

// Lazy-loaded sh-syntax module
let shSyntaxModule: typeof import('sh-syntax') | null = null;

/**
 * Lazily load the sh-syntax module.
 * This avoids loading the WASM binary until it's actually needed.
 */
async function getShSyntax(): Promise<typeof import('sh-syntax')> {
    if (!shSyntaxModule) {
        shSyntaxModule = await import('sh-syntax');
    }
    return shSyntaxModule;
}

/**
 * Format shell script using the built-in WASM formatter (sh-syntax).
 *
 * @param text - The shell script source code.
 * @param options - Formatting options.
 * @returns The formatted text.
 * @throws Error if WASM formatting fails.
 */
export async function formatWithWasm(text: string, options: ShellFormatOptions): Promise<string> {
    const shSyntax = await getShSyntax();

    const printOptions: ShOptions = {
        indent: options.indent,
        binaryNextLine: options.binaryNextLine,
        switchCaseIndent: options.caseIndent,
        spaceRedirects: options.spaceRedirects,
        keepPadding: options.keepPadding,
        functionNextLine: options.functionNextLine,
        keepComments: true,
    };

    // Only set variant when explicitly specified — LangAuto (4) is not supported
    // by the sh-syntax WASM parser and will cause a runtime panic.
    if (options.variant && options.variant !== 'auto') {
        printOptions.variant = variantToLangCode(options.variant) as LangVariant;
    }

    // Use the text overload: print(text, ShOptions) → Promise<string>
    const result = await shSyntax.print(text, printOptions);

    return result;
}
