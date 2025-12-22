#!/usr/bin/env node

/**
 * Compare formatting results between CLion and this plugin
 *
 * This script:
 * 1. Takes cmake test files from datasets/well-formatted/default
 * 2. Formats each file using CLion's command-line formatter
 * 3. Formats the same file using this plugin
 * 4. Compares the results and reports differences
 *
 * Usage:
 *   node scripts/test-clion-compare.js [options]
 *
 * Options:
 *   --clion-path <path>   Path to CLion executable (auto-detected if not set)
 *   --test-dir <path>     Directory containing test files (default: test/datasets/well-formatted/default)
 *   --file <name>         Test a specific file only
 *   --verbose             Show detailed diff output
 *   --keep-temp           Keep temporary files for debugging
 *   --help                Show this help message
 *
 * Environment:
 *   CLION_PATH            Path to CLion executable (alternative to --clion-path)
 *
 * Requirements:
 *   - CLion must be installed with command-line launcher configured
 *   - Run `npm run compile` first to build the formatter
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const os = require('os');

// Try to load the formatter (must be compiled first)
let formatCMake;
try {
    const formatterModule = require('../dist/src/formatter');
    formatCMake = formatterModule.formatCMake;
} catch (e) {
    console.error('❌ Error: Could not load formatter. Please run "npm run compile" first.');
    console.error(`   Details: ${e.message}`);
    process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    clionPath: process.env.CLION_PATH || null,
    testDir: path.join(__dirname, '../test/datasets/well-formatted/default'),
    file: null,
    verbose: false,
    keepTemp: false,
    help: false
};

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--clion-path':
            options.clionPath = args[++i];
            break;
        case '--test-dir':
            options.testDir = args[++i];
            break;
        case '--file':
            options.file = args[++i];
            break;
        case '--verbose':
            options.verbose = true;
            break;
        case '--keep-temp':
            options.keepTemp = true;
            break;
        case '--help':
        case '-h':
            options.help = true;
            break;
    }
}

if (options.help) {
    console.log(`
CLion vs Plugin Formatter Comparison Test

Usage:
  node scripts/test-clion-compare.js [options]

Options:
  --clion-path <path>   Path to CLion executable (auto-detected if not set)
  --test-dir <path>     Directory containing test files
                        (default: test/datasets/well-formatted/default)
  --file <name>         Test a specific file only
  --verbose             Show detailed diff output
  --keep-temp           Keep temporary files for debugging
  --help                Show this help message

Environment:
  CLION_PATH            Path to CLion executable (alternative to --clion-path)

Examples:
  # Run all tests with auto-detected CLion
  node scripts/test-clion-compare.js

  # Test a specific file
  node scripts/test-clion-compare.js --file simple-command.cmake

  # Use a specific CLion path
  node scripts/test-clion-compare.js --clion-path /opt/clion/bin/clion.sh

  # Verbose output with temp files kept
  node scripts/test-clion-compare.js --verbose --keep-temp
`);
    process.exit(0);
}

/**
 * Auto-detect CLion executable path based on platform
 */
function detectClionPath() {
    const platform = os.platform();
    const possiblePaths = [];

    if (platform === 'darwin') {
        // macOS paths
        possiblePaths.push(
            '/Applications/CLion.app/Contents/MacOS/clion',
            path.join(os.homedir(), 'Applications/CLion.app/Contents/MacOS/clion'),
            // JetBrains Toolbox paths
            path.join(os.homedir(), 'Library/Application Support/JetBrains/Toolbox/apps/CLion/ch-0/*/CLion.app/Contents/MacOS/clion'),
        );
        // Also try clion command if in PATH
        try {
            const result = spawnSync('which', ['clion'], { encoding: 'utf-8' });
            if (result.status === 0 && result.stdout.trim()) {
                possiblePaths.unshift(result.stdout.trim());
            }
        } catch (e) {
            // Ignore
        }
    } else if (platform === 'linux') {
        // Linux paths
        possiblePaths.push(
            '/opt/clion/bin/clion.sh',
            '/usr/local/bin/clion',
            '/snap/bin/clion',
            path.join(os.homedir(), '.local/share/JetBrains/Toolbox/apps/CLion/ch-0/*/bin/clion.sh'),
            path.join(os.homedir(), 'clion/bin/clion.sh'),
        );
        // Also try clion command if in PATH
        try {
            const result = spawnSync('which', ['clion'], { encoding: 'utf-8' });
            if (result.status === 0 && result.stdout.trim()) {
                possiblePaths.unshift(result.stdout.trim());
            }
        } catch (e) {
            // Ignore
        }
    } else if (platform === 'win32') {
        // Windows paths
        const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
        const localAppData = process.env['LOCALAPPDATA'] || path.join(os.homedir(), 'AppData', 'Local');
        possiblePaths.push(
            path.join(programFiles, 'JetBrains', 'CLion*', 'bin', 'clion64.exe'),
            path.join(localAppData, 'JetBrains', 'Toolbox', 'apps', 'CLion', 'ch-0', '*', 'bin', 'clion64.exe'),
        );
    }

    // Handle glob patterns
    for (const possiblePath of possiblePaths) {
        if (possiblePath.includes('*')) {
            // Expand glob pattern
            try {
                const dir = path.dirname(possiblePath);
                const base = path.basename(possiblePath);
                const parentDir = path.dirname(dir);
                const parentPattern = path.basename(dir);

                if (parentPattern.includes('*')) {
                    // Parent directory has pattern
                    const actualParent = fs.readdirSync(path.dirname(parentDir))
                        .filter(d => {
                            const regex = new RegExp('^' + parentPattern.replace(/\*/g, '.*') + '$');
                            return regex.test(d);
                        })
                        .sort()
                        .reverse()[0]; // Get latest version

                    if (actualParent) {
                        const expandedPath = path.join(path.dirname(parentDir), actualParent, base);
                        if (fs.existsSync(expandedPath)) {
                            return expandedPath;
                        }
                    }
                }
            } catch (e) {
                // Ignore glob expansion errors
            }
        } else if (fs.existsSync(possiblePath)) {
            return possiblePath;
        }
    }

    return null;
}

/**
 * Format a file using CLion command-line formatter
 * @param {string} clionPath - Path to CLion executable
 * @param {string} inputFile - Path to input file
 * @param {string} outputFile - Path to output file
 * @returns {boolean} - True if successful
 */
function formatWithClion(clionPath, inputFile, outputFile) {
    // Copy input to output first (CLion formats in-place)
    fs.copyFileSync(inputFile, outputFile);

    try {
        // CLion command-line format syntax:
        // clion format -allowDefaults <file>
        const result = spawnSync(clionPath, ['format', '-allowDefaults', outputFile], {
            encoding: 'utf-8',
            timeout: 60000, // 60 second timeout
            stdio: ['pipe', 'pipe', 'pipe']
        });

        if (result.error) {
            throw result.error;
        }

        if (result.status !== 0) {
            console.error(`CLion format stderr: ${result.stderr}`);
            return false;
        }

        return true;
    } catch (e) {
        console.error(`Error running CLion: ${e.message}`);
        return false;
    }
}

/**
 * Format a file using this plugin's formatter
 * @param {string} inputFile - Path to input file
 * @returns {string} - Formatted content
 */
function formatWithPlugin(inputFile) {
    const content = fs.readFileSync(inputFile, 'utf-8');
    // Use default options to match CLion defaults
    return formatCMake(content, {});
}

/**
 * Compare two strings and return diff information
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {object} - Diff info
 */
function compareStrings(a, b) {
    if (a === b) {
        return { equal: true, diff: null };
    }

    const linesA = a.split('\n');
    const linesB = b.split('\n');

    const differences = [];
    const maxLines = Math.max(linesA.length, linesB.length);

    for (let i = 0; i < maxLines; i++) {
        const lineA = linesA[i];
        const lineB = linesB[i];

        if (lineA !== lineB) {
            differences.push({
                line: i + 1,
                clion: lineA === undefined ? '<missing>' : JSON.stringify(lineA),
                plugin: lineB === undefined ? '<missing>' : JSON.stringify(lineB)
            });
        }
    }

    return {
        equal: false,
        linesA: linesA.length,
        linesB: linesB.length,
        differences: differences.slice(0, 10) // Limit to first 10 differences
    };
}

/**
 * List all cmake files in a directory (recursively)
 * @param {string} dir - Directory path
 * @returns {string[]} - Array of file paths
 */
function listCMakeFiles(dir) {
    const results = [];

    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                results.push(...listCMakeFiles(fullPath));
            } else if (entry.isFile() && entry.name.endsWith('.cmake')) {
                results.push(fullPath);
            }
        }
    } catch (e) {
        console.error(`Error reading directory ${dir}: ${e.message}`);
    }

    return results;
}

// Main execution
console.log('============================================================');
console.log('CLion vs Plugin Formatter Comparison Test');
console.log('============================================================');

// Detect or validate CLion path
let clionPath = options.clionPath;
if (!clionPath) {
    console.log('🔍 Auto-detecting CLion path...');
    clionPath = detectClionPath();
}

if (!clionPath) {
    console.error(`
❌ CLion not found. Please specify the path using one of:
   - --clion-path <path> argument
   - CLION_PATH environment variable

   Example paths:
   - macOS: /Applications/CLion.app/Contents/MacOS/clion
   - Linux: /opt/clion/bin/clion.sh or /snap/bin/clion
   - Windows: C:\\Program Files\\JetBrains\\CLion\\bin\\clion64.exe
`);
    process.exit(1);
}

console.log(`📍 CLion path: ${clionPath}`);

// Verify CLion exists
if (!fs.existsSync(clionPath)) {
    console.error(`❌ CLion executable not found: ${clionPath}`);
    process.exit(1);
}

// Get test files
let testFiles;
if (options.file) {
    const specificFile = path.join(options.testDir, options.file);
    if (!fs.existsSync(specificFile)) {
        console.error(`❌ Test file not found: ${specificFile}`);
        process.exit(1);
    }
    testFiles = [specificFile];
} else {
    testFiles = listCMakeFiles(options.testDir);
}

if (testFiles.length === 0) {
    console.error(`❌ No cmake files found in: ${options.testDir}`);
    process.exit(1);
}

console.log(`📁 Found ${testFiles.length} test file(s)\n`);

// Create temp directory
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clion-compare-'));
console.log(`📂 Temp directory: ${tempDir}`);
console.log('');

// Track results
const results = {
    passed: [],
    failed: [],
    errors: []
};

// Test each file
for (let i = 0; i < testFiles.length; i++) {
    const testFile = testFiles[i];
    const relativePath = path.relative(options.testDir, testFile);

    process.stdout.write(`[${i + 1}/${testFiles.length}] ${relativePath}... `);

    const baseName = path.basename(testFile, '.cmake');
    const clionOutputFile = path.join(tempDir, `${baseName}.clion.cmake`);
    const pluginOutputFile = path.join(tempDir, `${baseName}.plugin.cmake`);

    try {
        // Format with CLion
        const clionSuccess = formatWithClion(clionPath, testFile, clionOutputFile);
        if (!clionSuccess) {
            console.log('⚠️  CLion format failed');
            results.errors.push({ file: relativePath, error: 'CLion format failed' });
            continue;
        }

        // Format with plugin
        const pluginResult = formatWithPlugin(testFile);
        fs.writeFileSync(pluginOutputFile, pluginResult, 'utf-8');

        // Compare results
        const clionContent = fs.readFileSync(clionOutputFile, 'utf-8');
        const comparison = compareStrings(clionContent, pluginResult);

        if (comparison.equal) {
            console.log('✅ MATCH');
            results.passed.push({ file: relativePath });
        } else {
            console.log('❌ DIFFER');
            results.failed.push({
                file: relativePath,
                comparison,
                clionFile: clionOutputFile,
                pluginFile: pluginOutputFile
            });

            if (options.verbose) {
                console.log(`   CLion lines: ${comparison.linesA}, Plugin lines: ${comparison.linesB}`);
                console.log('   First differences:');
                for (const diff of comparison.differences.slice(0, 5)) {
                    console.log(`     Line ${diff.line}:`);
                    console.log(`       CLion:  ${diff.clion}`);
                    console.log(`       Plugin: ${diff.plugin}`);
                }
            }
        }
    } catch (e) {
        console.log(`❌ ERROR: ${e.message}`);
        results.errors.push({ file: relativePath, error: e.message });
    }
}

// Summary
console.log('\n============================================================');
console.log('Summary');
console.log('============================================================');
console.log(`✅ Matched: ${results.passed.length}/${testFiles.length}`);
console.log(`❌ Differed: ${results.failed.length}/${testFiles.length}`);
console.log(`⚠️  Errors: ${results.errors.length}/${testFiles.length}`);

// Show failed files
if (results.failed.length > 0) {
    console.log('\n❌ Files with differences:');
    for (const { file, clionFile, pluginFile } of results.failed) {
        console.log(`   ${file}`);
        if (options.keepTemp) {
            console.log(`      CLion:  ${clionFile}`);
            console.log(`      Plugin: ${pluginFile}`);
        }
    }
}

// Show errors
if (results.errors.length > 0) {
    console.log('\n⚠️  Files with errors:');
    for (const { file, error } of results.errors) {
        console.log(`   ${file}: ${error}`);
    }
}

// Cleanup temp directory
if (!options.keepTemp) {
    try {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log(`\n🗑️  Cleaned up temp directory`);
    } catch (e) {
        console.log(`\n⚠️  Could not clean temp directory: ${tempDir}`);
    }
} else {
    console.log(`\n📂 Temp files kept at: ${tempDir}`);
}

// Exit with appropriate code
const exitCode = results.failed.length + results.errors.length;
if (exitCode === 0) {
    console.log('\n🎉 All tests passed!');
}
process.exit(exitCode);
