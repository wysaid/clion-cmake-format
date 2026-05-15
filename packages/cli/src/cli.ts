#!/usr/bin/env node
/**
 * cc-format CLI - Command line tool for formatting CMake and Shell files
 *
 * A standalone CLI tool that provides CMake and Shell formatting capabilities.
 * Supports project-level configuration files (.cc-format.jsonc) and global configuration.
 */

import { Command, Option } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
    formatCMake,
    FormatterOptions,
    DEFAULT_OPTIONS,
    CommandCase,
    findConfigFile,
    loadConfigFile,
    generateSampleConfig,
    CONFIG_FILE_NAMES,
    PROJECT_URL
} from '@cc-format/core';
import {
    formatShell,
    ShellFormatOptions,
    ShellVariant,
    DEFAULT_SHELL_OPTIONS,
    isShellFile
} from '@cc-format/shell';

// Package version - read from package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
let version = '1.4.0';
try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    version = pkg.version || version;
} catch {
    // Use default version if package.json is not available
}

/**
 * Global config directory following XDG Base Directory Specification
 * Falls back to ~/.config on non-XDG systems
 */
function getGlobalConfigDir(): string {
    const xdgConfigHome = process.env.XDG_CONFIG_HOME;
    if (xdgConfigHome) {
        return path.join(xdgConfigHome, 'cc-format');
    }
    return path.join(os.homedir(), '.config', 'cc-format');
}

/**
 * Global config file path
 */
function getGlobalConfigPath(): string {
    return path.join(getGlobalConfigDir(), '.cc-format.jsonc');
}

/**
 * Load global configuration file
 */
function loadGlobalConfig(): Partial<FormatterOptions> {
    const globalConfigPath = getGlobalConfigPath();
    if (fs.existsSync(globalConfigPath)) {
        const config = loadConfigFile(globalConfigPath);
        if (config) {
            return config.options;
        }
    }
    return {};
}

/**
 * Get formatter options for a file
 * Priority: CLI options > project config > global config > defaults
 */
function getFormatterOptions(
    filePath: string,
    cliOptions: Partial<FormatterOptions>,
    useProjectConfig: boolean
): FormatterOptions {
    // Start with defaults
    let options = { ...DEFAULT_OPTIONS };

    // Apply global config
    const globalOptions = loadGlobalConfig();
    options = { ...options, ...globalOptions };

    // Apply project config if enabled
    if (useProjectConfig) {
        const configPath = findConfigFile(filePath);
        if (configPath) {
            const config = loadConfigFile(configPath);
            if (config) {
                options = { ...options, ...config.options };
            }
        }
    }

    // Apply CLI options (highest priority)
    options = { ...options, ...cliOptions };

    return options;
}

/**
 * Detect file language based on filename/extension.
 * Returns 'cmake', 'shell', or 'unknown'.
 */
function detectLanguage(filePath: string): 'cmake' | 'shell' | 'unknown' {
    const basename = path.basename(filePath);

    // CMake files
    if (basename === 'CMakeLists.txt' || basename.endsWith('.cmake')) {
        return 'cmake';
    }

    // Shell files
    if (isShellFile(basename)) {
        return 'shell';
    }

    return 'unknown';
}

/**
 * Format a single file
 */
function formatFile(
    filePath: string,
    cmakeOptions: FormatterOptions,
    shellOptions: ShellFormatOptions,
    write: boolean,
    check: boolean,
    language?: string
): Promise<{ success: boolean; changed: boolean; error?: string }> {
    return formatFileAsync(filePath, cmakeOptions, shellOptions, write, check, language);
}

async function formatFileAsync(
    filePath: string,
    cmakeOptions: FormatterOptions,
    shellOptions: ShellFormatOptions,
    write: boolean,
    check: boolean,
    language?: string
): Promise<{ success: boolean; changed: boolean; error?: string }> {
    try {
        const absolutePath = path.resolve(filePath);
        const content = fs.readFileSync(absolutePath, 'utf-8');

        // Normalize line endings to LF
        const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // Determine language
        const lang = language || detectLanguage(absolutePath);

        let formatted: string;
        if (lang === 'shell') {
            formatted = await formatShell(normalizedContent, shellOptions);
        } else {
            formatted = formatCMake(normalizedContent, cmakeOptions);
        }

        // Preserve original line endings (CRLF or LF)
        const hasCRLF = content.includes('\r\n');
        const outputContent = hasCRLF ? formatted.replace(/\n/g, '\r\n') : formatted;

        const changed = content !== outputContent;

        if (check) {
            return { success: !changed, changed };
        }

        if (write && changed) {
            fs.writeFileSync(absolutePath, outputContent, 'utf-8');
        }

        return { success: true, changed };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, changed: false, error: message };
    }
}

/**
 * Format content from stdin
 */
function formatStdin(cmakeOptions: FormatterOptions, shellOptions: ShellFormatOptions, language?: string): void {
    let content = '';
    process.stdin.setEncoding('utf-8');

    process.stdin.on('data', (chunk) => {
        content += chunk;
    });

    process.stdin.on('end', async () => {
        // Normalize line endings to LF
        const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        let formatted: string;
        if (language === 'shell') {
            formatted = await formatShell(normalizedContent, shellOptions);
        } else {
            formatted = formatCMake(normalizedContent, cmakeOptions);
        }
        process.stdout.write(formatted);
    });

    process.stdin.on('error', (err) => {
        console.error(`Error reading from stdin: ${err.message}`);
        process.exit(1);
    });

    // Important: resume() to ensure stdin flows
    process.stdin.resume();
}

/**
 * Find all formattable files in a directory recursively
 */
function findFormattableFiles(dir: string, language?: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip hidden directories and common non-source directories
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'build') {
            continue;
        }

        if (entry.isDirectory()) {
            files.push(...findFormattableFiles(fullPath, language));
        } else if (entry.isFile()) {
            if (language === 'cmake') {
                if (entry.name === 'CMakeLists.txt' || entry.name.endsWith('.cmake')) {
                    files.push(fullPath);
                }
            } else if (language === 'shell') {
                if (isShellFile(entry.name)) {
                    files.push(fullPath);
                }
            } else {
                // No specific language — collect both
                if (entry.name === 'CMakeLists.txt' || entry.name.endsWith('.cmake') || isShellFile(entry.name)) {
                    files.push(fullPath);
                }
            }
        }
    }

    return files;
}

/**
 * Initialize global configuration file
 */
function initGlobalConfig(): void {
    const configDir = getGlobalConfigDir();
    const configPath = getGlobalConfigPath();

    // Create directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    if (fs.existsSync(configPath)) {
        console.log(`Global config already exists at: ${configPath}`);
        return;
    }

    const content = generateSampleConfig(DEFAULT_OPTIONS);
    fs.writeFileSync(configPath, content, 'utf-8');
    console.log(`Global config created at: ${configPath}`);
}

/**
 * Initialize project configuration file
 */
function initProjectConfig(targetDir?: string): void {
    const dir = targetDir || process.cwd();
    const configPath = path.join(dir, CONFIG_FILE_NAMES[0]);

    if (fs.existsSync(configPath)) {
        console.log(`Project config already exists at: ${configPath}`);
        return;
    }

    const content = generateSampleConfig(DEFAULT_OPTIONS);
    fs.writeFileSync(configPath, content, 'utf-8');
    console.log(`Project config created at: ${configPath}`);
}

/**
 * Parse CLI options into FormatterOptions
 */
function parseCLIOptions(options: Record<string, unknown>): Partial<FormatterOptions> {
    const formatterOptions: Partial<FormatterOptions> = {};

    // Tab and Indent
    if (typeof options.useTabs === 'boolean') {
        formatterOptions.useTabs = options.useTabs;
    }
    if (typeof options.tabSize === 'number') {
        formatterOptions.tabSize = Math.min(16, Math.max(1, options.tabSize));
    }
    if (typeof options.indentSize === 'number') {
        formatterOptions.indentSize = Math.min(16, Math.max(1, options.indentSize));
    }
    if (typeof options.continuationIndentSize === 'number') {
        formatterOptions.continuationIndentSize = Math.min(16, Math.max(1, options.continuationIndentSize));
    }

    // Command Case
    if (typeof options.commandCase === 'string') {
        const validCases: CommandCase[] = ['unchanged', 'lowercase', 'uppercase'];
        if (validCases.includes(options.commandCase as CommandCase)) {
            formatterOptions.commandCase = options.commandCase as CommandCase;
        }
    }

    // Line Length
    if (typeof options.lineLength === 'number') {
        formatterOptions.lineLength = Math.max(0, options.lineLength);
    }

    // Blank Lines
    if (typeof options.maxBlankLines === 'number') {
        formatterOptions.maxBlankLines = Math.min(20, Math.max(0, options.maxBlankLines));
    }

    return formatterOptions;
}

/**
 * Main CLI program
 */
function main(): void {
    const program = new Command();

    program
        .name('cc-format')
        .description(`Code formatter for CMake and Shell scripts\n\nProject: ${PROJECT_URL}`)
        .version(version)
        .argument('[files...]', 'Files or directories to format')
        .option('-w, --write', 'Write formatted output back to files', false)
        .option('-c, --check', 'Check if files are formatted (exit with error if not)', false)
        .option('--stdin', 'Read from stdin and write to stdout')
        .option('-l, --language <lang>', 'Language to format: cmake, shell (auto-detected by default)')
        .option('--no-project-config', 'Ignore project-level .cc-format.jsonc files')
        .addOption(
            new Option('--command-case <case>', 'CMake: Command case transformation')
                .choices(['unchanged', 'lowercase', 'uppercase'])
        )
        .option('--indent-size <size>', 'CMake: Number of spaces for indentation', parseInt)
        .option('--tab-size <size>', 'CMake: Number of spaces per tab', parseInt)
        .option('--use-tabs', 'CMake: Use tabs instead of spaces')
        .option('--continuation-indent-size <size>', 'CMake: Continuation line indent size', parseInt)
        .option('--line-length <length>', 'CMake: Maximum line length (0 for unlimited)', parseInt)
        .option('--max-blank-lines <count>', 'CMake: Maximum consecutive blank lines', parseInt)
        .option('--shfmt-path <path>', 'Shell: Path to local shfmt binary')
        .option('--shell-indent <size>', 'Shell: Number of spaces for indentation (0 for tabs)', parseInt)
        .addOption(
            new Option('--shell-variant <variant>', 'Shell: Language variant')
                .choices(['auto', 'bash', 'posix', 'mksh', 'bats'])
        )
        .option('--shell-bn', 'Shell: Binary operators may start a line')
        .option('--shell-ci', 'Shell: Indent switch case bodies')
        .option('--shell-sr', 'Shell: Space after redirect operators')
        .option('--shell-kp', 'Shell: Keep column alignment padding')
        .option('--shell-fn', 'Shell: Function opening brace on next line')
        .option('--init', 'Create a .cc-format.jsonc config file in current directory')
        .option('--init-global', 'Create a global .cc-format.jsonc config file')
        .option('--config-path', 'Show path to global config file');

    program.parse();

    const options = program.opts();
    const files = program.args;

    // Handle special commands
    if (options.configPath) {
        console.log(getGlobalConfigPath());
        return;
    }

    if (options.initGlobal) {
        initGlobalConfig();
        return;
    }

    if (options.init) {
        initProjectConfig();
        return;
    }

    // Parse CLI formatting options
    const cliOptions = parseCLIOptions({
        useTabs: options.useTabs,
        tabSize: options.tabSize,
        indentSize: options.indentSize,
        continuationIndentSize: options.continuationIndentSize,
        commandCase: options.commandCase,
        lineLength: options.lineLength,
        maxBlankLines: options.maxBlankLines
    });

    // Parse shell-specific CLI options
    const shellCliOptions: Partial<ShellFormatOptions> = {};
    if (options.shfmtPath) shellCliOptions.shfmtPath = options.shfmtPath;
    if (options.shellIndent !== undefined) shellCliOptions.indent = options.shellIndent;
    if (options.shellVariant) shellCliOptions.variant = options.shellVariant as ShellVariant;
    if (options.shellBn) shellCliOptions.binaryNextLine = true;
    if (options.shellCi) shellCliOptions.caseIndent = true;
    if (options.shellSr) shellCliOptions.spaceRedirects = true;
    if (options.shellKp) shellCliOptions.keepPadding = true;
    if (options.shellFn) shellCliOptions.functionNextLine = true;

    const useProjectConfig = options.projectConfig !== false;
    const language = options.language as string | undefined;

    // Handle stdin
    if (options.stdin) {
        const cmakeOptions = { ...DEFAULT_OPTIONS, ...loadGlobalConfig(), ...cliOptions };
        const shellOptions: ShellFormatOptions = { ...DEFAULT_SHELL_OPTIONS, ...shellCliOptions };
        formatStdin(cmakeOptions, shellOptions, language);
        return;
    }

    // Collect all files to process
    const allFiles: string[] = [];
    for (const file of files) {
        const resolvedPath = path.resolve(file);
        if (!fs.existsSync(resolvedPath)) {
            console.error(`Error: File not found: ${file}`);
            process.exit(1);
        }

        const stat = fs.statSync(resolvedPath);
        if (stat.isDirectory()) {
            allFiles.push(...findFormattableFiles(resolvedPath, language));
        } else {
            allFiles.push(resolvedPath);
        }
    }

    if (allFiles.length === 0) {
        if (files.length === 0) {
            program.help();
        } else {
            console.log('No formattable files found.');
        }
        return;
    }

    // Format files (async for shell support)
    runFormatting(allFiles, cliOptions, shellCliOptions, useProjectConfig, language, options).catch((err) => {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    });
}

/**
 * Run formatting on collected files
 */
async function runFormatting(
    allFiles: string[],
    cliOptions: Partial<FormatterOptions>,
    shellCliOptions: Partial<ShellFormatOptions>,
    useProjectConfig: boolean,
    language: string | undefined,
    options: Record<string, unknown>
): Promise<void> {
    let hasErrors = false;
    let changedCount = 0;
    let unchangedCount = 0;

    for (const file of allFiles) {
        const cmakeOptions = getFormatterOptions(file, cliOptions, useProjectConfig);
        const shellOptions: ShellFormatOptions = { ...DEFAULT_SHELL_OPTIONS, ...shellCliOptions };
        const result = await formatFile(file, cmakeOptions, shellOptions, options.write as boolean, options.check as boolean, language);

        if (!result.success) {
            console.error(`Error: ${file}: ${result.error}`);
            hasErrors = true;
        } else if (result.changed) {
            changedCount++;
            if (options.check) {
                console.log(`Would reformat: ${file}`);
            } else if (options.write) {
                console.log(`Formatted: ${file}`);
            } else {
                // Output formatted content to stdout
                const content = fs.readFileSync(file, 'utf-8');
                const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                const lang = language || detectLanguage(file);
                let formatted: string;
                if (lang === 'shell') {
                    formatted = await formatShell(normalizedContent, shellOptions);
                } else {
                    formatted = formatCMake(normalizedContent, cmakeOptions);
                }
                process.stdout.write(formatted);
            }
        } else {
            unchangedCount++;
            if (!options.write && !options.check) {
                // In stdout mode, output unchanged files too
                const content = fs.readFileSync(file, 'utf-8');
                const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                const lang = language || detectLanguage(file);
                let formatted: string;
                if (lang === 'shell') {
                    formatted = await formatShell(normalizedContent, shellOptions);
                } else {
                    formatted = formatCMake(normalizedContent, cmakeOptions);
                }
                process.stdout.write(formatted);
            }
        }
    }

    // Summary output for write/check mode
    if (options.write || options.check) {
        if (options.check) {
            console.log(`\n${changedCount} file(s) would be reformatted, ${unchangedCount} file(s) already formatted.`);
            if (changedCount > 0 || hasErrors) {
                process.exit(1);
            }
        } else {
            console.log(`\nFormatted ${changedCount} file(s), ${unchangedCount} file(s) unchanged.`);
        }
    }

    if (hasErrors) {
        process.exit(1);
    }
}

// Run CLI
main();
