/**
 * @cc-format/shell - Shell script formatter (hybrid mode)
 *
 * Dispatches to either a local shfmt binary or the built-in WASM formatter.
 * Priority: local shfmt (if configured and available) → WASM fallback.
 */

import { ShellFormatOptions, DEFAULT_SHELL_OPTIONS } from './config';
import { isShfmtAvailable, formatWithShfmt } from './shfmt';
import { formatWithWasm } from './wasm';

// Cache shfmt availability check per path to avoid repeated probing
const shfmtAvailabilityCache = new Map<string, boolean>();

/**
 * Format a shell script using the hybrid strategy:
 * 1. If a local shfmt path is configured and available, use it.
 * 2. Otherwise, fall back to the built-in WASM formatter.
 *
 * @param text - The shell script source code.
 * @param options - Formatting options (partial, merged with defaults).
 * @returns The formatted text.
 * @throws Error if both formatters fail.
 */
export async function formatShell(
    text: string,
    options?: Partial<ShellFormatOptions>
): Promise<string> {
    const mergedOptions: ShellFormatOptions = { ...DEFAULT_SHELL_OPTIONS, ...options };

    // Try local shfmt first if configured
    if (mergedOptions.shfmtPath) {
        let available = shfmtAvailabilityCache.get(mergedOptions.shfmtPath);
        if (available === undefined) {
            available = await isShfmtAvailable(mergedOptions.shfmtPath);
            shfmtAvailabilityCache.set(mergedOptions.shfmtPath, available);
        }

        if (available) {
            try {
                return await formatWithShfmt(text, mergedOptions);
            } catch {
                // Fall through to WASM if shfmt fails
            }
        }
    }

    // Fall back to WASM formatter
    return formatWithWasm(text, mergedOptions);
}

/**
 * Clear the shfmt availability cache.
 * Useful when the user changes the shfmt path setting.
 */
export function clearShfmtCache(): void {
    shfmtAvailabilityCache.clear();
}
