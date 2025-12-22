# CLion Comparison Testing

This document describes how to run comparison tests between CLion's native formatter and this plugin.

## Overview

The comparison test (`scripts/test-clion-compare.js`) formats cmake files using both CLion's command-line formatter and this plugin, then compares the results to verify compatibility.

## Prerequisites

### 1. Install CLion

You need CLion installed on your system. Download from: https://www.jetbrains.com/clion/

### 2. Configure Command-Line Launcher

CLion must be accessible from the command line:

**macOS:**
- Open CLion
- Go to `Tools → Create Command-line Launcher...`
- This creates `/usr/local/bin/clion`

**Linux:**
- Add CLion's bin directory to your PATH
- Or create a symlink: `sudo ln -s /opt/clion/bin/clion.sh /usr/local/bin/clion`

**Windows:**
- Add `C:\Program Files\JetBrains\CLion\bin` to your system PATH
- Or use the full path when running the test

### 3. Build the Plugin

```bash
npm run compile
```

## Running the Test

### Basic Usage

```bash
# Auto-detect CLion and run all tests
node scripts/test-clion-compare.js

# Or use npm script (if added to package.json)
npm run test:clion
```

### Specify CLion Path

```bash
# Using command-line argument
node scripts/test-clion-compare.js --clion-path /path/to/clion

# Using environment variable
CLION_PATH=/path/to/clion node scripts/test-clion-compare.js
```

### Test Specific Files

```bash
# Test a single file
node scripts/test-clion-compare.js --file simple-command.cmake

# Test files in a different directory
node scripts/test-clion-compare.js --test-dir test/datasets/cmake-official
```

### Debug Mode

```bash
# Verbose output with detailed diffs
node scripts/test-clion-compare.js --verbose

# Keep temp files for manual inspection
node scripts/test-clion-compare.js --keep-temp --verbose
```

## CLion Path Examples

| Platform | Typical Path |
|----------|--------------|
| macOS | `/Applications/CLion.app/Contents/MacOS/clion` |
| macOS (Toolbox) | `~/Library/Application Support/JetBrains/Toolbox/apps/CLion/ch-0/*/CLion.app/Contents/MacOS/clion` |
| Linux | `/opt/clion/bin/clion.sh` |
| Linux (Snap) | `/snap/bin/clion` |
| Linux (Toolbox) | `~/.local/share/JetBrains/Toolbox/apps/CLion/ch-0/*/bin/clion.sh` |
| Windows | `C:\Program Files\JetBrains\CLion\bin\clion64.exe` |

## Understanding Results

The test outputs:

- **✅ MATCH**: CLion and plugin produce identical output
- **❌ DIFFER**: Outputs are different (shows first differences in verbose mode)
- **⚠️ ERROR**: Could not complete the comparison (e.g., CLion timeout)

## Known Differences

Some formatting differences between CLion and this plugin are intentional. When encountering differences:

1. First check if the difference is intentional (documented behavior)
2. If not intentional, create an issue or fix the formatter
3. Update test cases to avoid testing intentionally different behaviors

## Troubleshooting

### CLion Not Found

If the script cannot find CLion:

```bash
# Set the path explicitly
export CLION_PATH=/your/path/to/clion
node scripts/test-clion-compare.js
```

### CLion Format Timeout

If CLion takes too long (>60s):
- This usually happens on first run when CLion initializes
- Try running the test again
- Or increase timeout in the script

### CLion Format Fails

If CLion returns non-zero exit code:
- Check that CLion's command-line formatter works: `clion format --help`
- Ensure no other CLion instance is running (CLI formatter conflicts with running IDE)
- Check CLion logs for errors

## Adding Test Cases

To add new comparison test cases:

1. Add `.cmake` files to `test/datasets/well-formatted/default/`
2. These files should represent the **expected** output format
3. Run the comparison test to verify CLion produces the same output

## CI Integration

This test is not included in regular CI because it requires CLion installation. For local development:

```bash
# Full test cycle
npm run compile
npm run lint
npm run test:unit
node scripts/test-clion-compare.js  # Requires CLion
```
