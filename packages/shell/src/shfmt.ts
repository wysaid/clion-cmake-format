/**
 * @cc-format/shell - Local shfmt binary wrapper
 *
 * Wraps a locally installed shfmt binary via child_process.
 * Used when the user has shfmt installed and prefers it over WASM.
 */

import { execFile } from 'child_process';
import { ShellFormatOptions } from './config';

/**
 * Check if a local shfmt binary is available at the given path.
 */
export async function isShfmtAvailable(shfmtPath: string): Promise<boolean> {
    if (!shfmtPath) {
        return false;
    }

    return new Promise((resolve) => {
        execFile(shfmtPath, ['--version'], { timeout: 5000 }, (error) => {
            resolve(!error);
        });
    });
}

/**
 * Build shfmt command-line arguments from options.
 */
export function buildShfmtArgs(options: ShellFormatOptions): string[] {
    const args: string[] = [];

    // Indentation
    args.push('-i', String(options.indent));

    // Binary next line
    if (options.binaryNextLine) {
        args.push('-bn');
    }

    // Case indent
    if (options.caseIndent) {
        args.push('-ci');
    }

    // Space redirects
    if (options.spaceRedirects) {
        args.push('-sr');
    }

    // Keep padding
    if (options.keepPadding) {
        args.push('-kp');
    }

    // Function next line
    if (options.functionNextLine) {
        args.push('-fn');
    }

    // Language variant
    if (options.variant && options.variant !== 'auto') {
        args.push('-ln', options.variant);
    }

    return args;
}

/**
 * Format shell script using a local shfmt binary.
 *
 * @param text - The shell script source code.
 * @param options - Formatting options.
 * @returns The formatted text.
 * @throws Error if shfmt fails.
 */
export async function formatWithShfmt(text: string, options: ShellFormatOptions): Promise<string> {
    const shfmtPath = options.shfmtPath;
    if (!shfmtPath) {
        throw new Error('shfmt path is not configured');
    }

    const args = buildShfmtArgs(options);

    return new Promise((resolve, reject) => {
        const child = execFile(shfmtPath, args, {
            timeout: 30000,
            maxBuffer: 10 * 1024 * 1024, // 10MB
        }, (error, stdout, stderr) => {
            if (error) {
                const msg = stderr?.trim() || error.message;
                reject(new Error(`shfmt error: ${msg}`));
                return;
            }
            resolve(stdout);
        });

        // Write input to stdin
        if (child.stdin) {
            child.stdin.write(text);
            child.stdin.end();
        }
    });
}
