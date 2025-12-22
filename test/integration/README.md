# Integration Tests

This directory contains integration tests that compare formatting results between CLion and this plugin.

## Requirements

- **CLion**: Either installed locally or auto-downloaded (see below)
- **Node.js**: For running tests
- **Git**: For diff comparison

## Running Tests

### Option 1: Automatic CLion Download (Recommended)

If you don't have CLion installed, use the automatic download feature:

```bash
# Download CLion and run integration tests (first time: ~1GB download)
npm run clion:integration

# Or step by step:
npm run clion:download      # Download CLion first
npm run test:integration    # Run tests
```

### Option 2: Use Existing CLion Installation

If you have CLion installed, set the `CLION_PATH` environment variable:

```bash
# Set CLion path
export CLION_PATH=/Applications/CLion.app/Contents/MacOS/clion

# Run tests
npm run test:integration
```

### Option 3: Unit Tests Only (No CLion Required)

```bash
# Run only unit tests (no external dependencies)
npm run test:unit
```

## Test Commands

```bash
# Run only integration tests (requires CLion)
npm run test:integration

# Run unit tests only (no external dependencies)
npm run test:unit

# Run all tests (unit + integration)
npm run test:all

# Download CLion automatically
npm run clion:download

# Run integration tests with auto-downloaded CLion
npm run clion:integration
```

## Test Files

- **clion-comparison.test.ts**: Compares formatting results between CLion and this plugin across all test datasets

## How It Works

1. Copies test datasets to a temporary directory
2. Formats one copy with the plugin
3. Formats another copy with CLion
4. Compares the results using manual diff
5. Reports any differences found

## Why Separate?

These tests are separated from regular unit tests because:

1. They require external dependencies (CLion) that users may not have installed
2. They take longer to run (~5-10 seconds)
3. Users can run `npm test` without needing CLion installed
4. CI/CD pipelines can selectively run integration tests

## CI/CD

Integration tests run automatically via GitHub Actions:

- Weekly scheduled runs
- On PRs that modify integration test files
- Manual trigger available

See `.github/workflows/clion-integration.yml` for details.

