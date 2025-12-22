# CLion Integration Testing

This document describes two types of CLion-related tests:

1. **Validation Script** (`scripts/validate-with-clion.js`) - Validates that test datasets match CLion's formatting standard
2. **Integration Tests** (`test/integration/clion-comparison.test.ts`) - Compares plugin output with CLion output

## ⚠️ Important: License Requirement

**CLion's `format` command requires a valid, activated license.** This cannot be automated in CI/container environments because:

- JetBrains license activation requires GUI interaction or network validation
- The `registerKey` command doesn't persist licenses for CLI-only usage
- Offline activation codes still require initial GUI-based setup

**Recommended approach**: Run integration tests on developer machines where CLion is already installed and activated via GUI.

## Validation Script

The validation script (`scripts/validate-with-clion.js`) verifies that test files in `test/datasets/well-formatted/` are correctly formatted according to CLion's formatter. It does **not** compare the plugin's output with CLion - it only checks if the test files themselves match CLion's expected format.

### Purpose

- Ensure test datasets are correctly formatted as CLion would format them
- Catch any drift in test data that doesn't match CLion's current formatting behavior
- Validate new test cases before adding them to the well-formatted dataset

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

## Running the Validation Script

### Basic Usage

```bash
# Auto-detect CLion and validate all files in default directory
node scripts/validate-with-clion.js

# Or use npm script
npm run test:clion
```

### Specify CLion Path

```bash
# Using command-line argument
node scripts/validate-with-clion.js --clion-path /path/to/clion

# Using environment variable
CLION_PATH=/path/to/clion node scripts/validate-with-clion.js
```

### Validate Specific Files

```bash
# Validate files in a different directory
node scripts/validate-with-clion.js --test-dir test/datasets/basic

# With verbose output
node scripts/validate-with-clion.js --verbose --restore
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

## Understanding Validation Results

The validation script outputs:

- **✅ MATCH**: Test file matches CLion's formatting (no changes needed)
- **❌ DIFFER**: Test file differs from CLion's formatting (needs updating)

## Integration Tests (Plugin vs CLion)

For actual comparison between the plugin's formatter and CLion's formatter, run the integration tests:

```bash
npm run test:integration
```

This test suite:
1. Copies test datasets to a temporary directory
2. Formats one copy with the plugin
3. Formats another copy with CLion
4. Compares the results to verify compatibility

See `test/integration/clion-comparison.test.ts` for implementation details.

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

### CLion Validated Test Cases

To add new test cases to the well-formatted dataset:

1. Add `.cmake` files to `test/datasets/well-formatted/default/`
2. Format them with CLion first to ensure they match CLion's standard
3. Run the validation script to verify: `node scripts/validate-with-clion.js`
4. Commit only if validation passes

## Automatic CLion Download (Recommended)

If you don't have CLion installed, you can use the automatic download feature. This uses the IntelliJ Platform Gradle Plugin to download CLion without a local installation.

### Requirements

- **JDK 17+**: Required for Gradle and CLion
- **Node.js**: For running tests
- **Git**: For diff comparison
- **CLion License**: ⚠️ **Important**: CLion requires a valid license to run formatting commands

### License Requirement

⚠️ **Important**: The downloaded CLion is a full IDE that requires activation. Without a valid license, the `format` command will fail with "No valid license found".

**Why can't we use trial license in CI?**

JetBrains trial license activation requires:
1. Internet connection to JetBrains servers
2. Login with JetBrains Account (interactive authentication)
3. GUI interaction to accept EULA terms

These steps cannot be automated in a headless (no GUI) container environment. There is no command-line option or environment variable to activate a trial license.

**Options for CI/CD environments:**

1. **JetBrains Floating License Server**: For enterprise CI/CD environments
   - Deploy a [JetBrains License Server](https://www.jetbrains.com/help/license_server/)
   - Note: License Server is being discontinued on December 31, 2025
   - Set `JETBRAINS_FLS_URL` environment variable

2. **JetBrains Open Source License**: Apply for a free license for open source projects:
   - https://www.jetbrains.com/community/opensource/
   - After approval, generate an offline activation code

3. **Offline Activation Code**: Generate from your JetBrains Account
   - Login to https://account.jetbrains.com/
   - Navigate to your license and generate offline activation code
   - Store as GitHub Secret and use in CI

4. **Use Qodana for CI/CD** (Recommended alternative):
   - JetBrains Qodana provides code analysis in CI/CD without license issues
   - Free for open source projects
   - See: https://www.jetbrains.com/qodana/

**For local development:**

1. **Use locally installed CLion**: If you have CLion installed and activated, use it instead:
   ```bash
   export CLION_PATH=/Applications/CLion.app/Contents/MacOS/clion
   npm run test:integration
   ```

2. **Educational License**: Students and educators can get free licenses:
   https://www.jetbrains.com/community/education/

3. **30-day Trial**: Install CLion with GUI and activate trial interactively

### Quick Start

```bash
# Download CLion (first time only, ~1GB download)
npm run clion:download

# Run integration tests with auto-downloaded CLion
# Note: Requires valid CLion license
npm run clion:integration

# Run validation tests with auto-downloaded CLion
# Note: Requires valid CLion license
npm run clion:validate
```

### Shell Script Commands

The `scripts/run-clion-tests.sh` script provides more control:

```bash
# Download CLion
./scripts/run-clion-tests.sh download

# Get CLion executable path
./scripts/run-clion-tests.sh path

# Run validation tests
./scripts/run-clion-tests.sh validate

# Run validation with verbose output
./scripts/run-clion-tests.sh validate --verbose

# Run integration tests
./scripts/run-clion-tests.sh integration

# Format specific directory
./scripts/run-clion-tests.sh format --target-dir test/datasets/basic
```

### How It Works

The automatic download uses [Gradle](https://gradle.org/) with the [IntelliJ Platform Gradle Plugin](https://plugins.jetbrains.com/docs/intellij/tools-intellij-platform-gradle-plugin.html):

1. The `clion-test/` directory contains a minimal Gradle project
2. Gradle Wrapper (`gradlew`) downloads Gradle automatically (no pre-installation needed)
3. The IntelliJ Platform Gradle Plugin downloads CLion to `~/.gradle/caches/`
4. Downloaded files are cached for subsequent runs

### Offline License Activation for CI

If you have a valid CLion license and want to use it in CI, you can set up offline activation:

**Step 1: Generate Offline Activation Code**

1. Login to https://account.jetbrains.com/
2. Go to "Licenses" section
3. Find your CLion license
4. Click "Generate Offline Activation Code"
5. Copy the generated key

**Step 2: Configure in CI (GitHub Actions)**

1. Add the activation code as a GitHub Secret named `CLION_OFFLINE_KEY`
2. In your workflow, create the license file:

```yaml
- name: Configure CLion License
  run: |
    mkdir -p ~/.config/JetBrains/CLion2024.3
    echo "${{ secrets.CLION_OFFLINE_KEY }}" > ~/.config/JetBrains/CLion2024.3/clion.key
```

**Note**: The exact path may vary based on CLion version. Check JetBrains documentation for your version.

### Cache Locations

- **Gradle**: `~/.gradle/wrapper/dists/`
- **CLion IDE**: `~/.gradle/caches/modules-2/files-2.1/com.jetbrains.intellij.clion/`

## CI Integration

CLion integration tests run automatically via GitHub Actions:

- **Weekly**: Runs every Sunday at midnight UTC
- **On PR**: When integration test files are modified
- **Manual**: Can be triggered via GitHub Actions UI

See `.github/workflows/clion-integration.yml` for the workflow configuration.

### Local CI-like Testing

```bash
# Full test cycle (same as CI)
npm run compile
npm run lint
npm run test:unit            # Unit tests (no CLion needed)
npm run clion:integration    # Plugin vs CLion comparison (auto-downloads CLion)
npm run clion:validate       # Validate datasets (auto-downloads CLion)
```

### Using Existing CLion Installation

If you already have CLion installed, set the `CLION_PATH` environment variable:

```bash
# Use existing CLion installation
export CLION_PATH=/Applications/CLion.app/Contents/MacOS/clion
npm run test:integration
npm run test:clion
```
