# Release Workflow Documentation

This document describes the CI/CD workflows for the clion-cmake-format monorepo.

## Project Structure

This is a monorepo containing three packages:

1. **@cc-format/core** - Core formatting engine (published to npm)
2. **cc-format** - CLI tool (published to npm)
3. **clion-cmake-format** - VS Code extension (published to VS Code Marketplace)

## CI Workflow

**Trigger**: Push to `main`/`master` or pull requests

**Purpose**: Validate code quality across all packages

### Jobs

#### 1. Build Job (Multi-version Node.js)
- **Node versions**: 18.x, 20.x, 22.x, 23.x
- **Steps**:
  - Install dependencies
  - Verify symlinks
  - Build all packages (core, cli, vscode)
  - Run linter
  - Run unit tests
  - Test core package exports
  - Test CLI functionality (version, help, stdin)
  - Build VSIX (Node 22.x only)
  - Upload VSIX artifact (7-day retention)

#### 2. CLI Cross-platform Job
- **Platforms**: Ubuntu, Windows, macOS
- **Node version**: 22.x
- **Purpose**: Ensure CLI works across all major operating systems
- **Tests**:
  - Version check
  - Help command
  - Stdin formatting
  - File formatting

## Release Workflow

**Triggers**:
- Tag push `v?X.Y.Z` (e.g., `v1.4.1`, `1.4.1`) - Stable release
- Tag push `v?X.Y.Z-<suffix>` (e.g., `v1.4.1-beta`, `1.4.1-alpha`) - Pre-release
- Manual trigger via workflow_dispatch (always dry-run)
- Master branch push (always dry-run)

**Purpose**: Publish packages and create releases

### Release Types

1. **Stable Release** (e.g., `v1.4.1`, `1.4.1`)
   - Publishes to VS Code Marketplace as **stable**
   - Creates GitHub Release (NOT marked as pre-release)
   - Format: `v?X.Y.Z` where X, Y, Z are numbers
   - With or without `v` prefix

2. **Pre-release** (e.g., `v1.4.1-alpha`, `1.4.1-beta`, `1.4.1-rc.1`)
   - Publishes to VS Code Marketplace as **pre-release**
   - Creates GitHub Release marked as pre-release
   - Format: `v?X.Y.Z-<suffix>` where suffix can be anything (alpha, beta, test, rc, dev, preview, etc.)
   - With or without `v` prefix

3. **Manual Trigger** (workflow_dispatch)
   - Can input any tag (e.g., `v1.4.1`, `v1.4.1-beta`)
   - Always runs in dry-run mode - NEVER publishes
   - Builds, tests, and uploads VSIX as artifact
   - Useful for testing specific tag builds

4. **Master Branch Push** (automatic)
   - Triggered on every push to master branch
   - Always runs in dry-run mode
   - Uses version from package.json
   - Produces VSIX artifact with 30-day retention

### Validation Steps

1. **Tag Format**: Validates semver pattern
2. **Version Consistency**: Tag must match package.json version
3. **Marketplace Check**: Prevents duplicate version publishing
4. **Build & Test**: Compiles, lints, and runs all tests

### Release Notes Generation

The workflow automatically generates comprehensive release notes including:

#### 📦 VS Code Extension
- Installation instructions
- Marketplace link
- Changes from `packages/vscode/CHANGELOG.md`

#### 🔧 CLI Tool
- npm installation instructions
- Usage examples
- Changes from `packages/cli/CHANGELOG.md`

#### 📚 Core Library
- npm installation instructions
- Changes from `packages/core/CHANGELOG.md`

### Publishing Flow

```
Tag push (e.g., v1.4.1 or v1.4.1-beta)
  ↓
Validate tag format (v?X.Y.Z or v?X.Y.Z-<suffix>)
  ↓
Build all packages
  ↓
Run tests
  ↓
Check VS Code Marketplace (skip if version exists)
  ↓
Publish to Marketplace (stable or pre-release)
  ↓
Generate release notes (includes all 3 packages)
  ↓
Create GitHub Release (with VSIX file)
```

### Manual Trigger Flow

```
Manual workflow dispatch (input tag: v1.4.1-beta)
  ↓
Always set to dry-run mode
  ↓
Build all packages
  ↓
Run tests
  ↓
Upload VSIX as artifact (30-day retention)
  ↓
NO publishing, NO GitHub Release
```

## Distribution Channels

| Package | Distribution | Installation |
|---------|-------------|--------------|
| **VS Code Extension** | VS Code Marketplace + GitHub Release | Install from Marketplace or download VSIX |
| **CLI Tool** | npm only | `npm install -g cc-format` |
| **Core Library** | npm only | `npm install @cc-format/core` |

### Why CLI is NOT in GitHub Release Assets

The CLI tool (`cc-format`) is distributed exclusively through npm because:

1. **Standard Distribution**: npm is the standard distribution channel for Node.js CLI tools
2. **Easy Installation**: Users can install with `npm install -g cc-format` or `npx cc-format`
3. **Automatic Updates**: npm handles version management and updates
4. **Cross-platform**: npm handles platform-specific installations automatically
5. **No Duplication**: GitHub Release is reserved for VS Code extension VSIX files

**Release Notes Still Include CLI**: The GitHub Release notes document all changes to CLI and core packages, with links to npm installation.

## Version Management

All three packages maintain synchronized versions:
- Root `package.json`: `1.4.1`
- `packages/core/package.json`: `1.4.1`
- `packages/cli/package.json`: `1.4.1`
- `packages/vscode/package.json`: `1.4.1`

Use the version management scripts:
```bash
# Bump version across all packages
bash scripts/bump-version.sh 1.5.0

# Check version consistency
bash scripts/check-versions.sh
```

## Manual Publishing

If you need to publish packages manually:

### VS Code Extension
```bash
npm run publish:vscode
```

### CLI Tool (to npm)
```bash
npm run publish:cli
```

### Core Library (to npm)
```bash
npm run publish:core
```

Or use the monorepo publish script:
```bash
bash scripts/publish-monorepo.sh
```

## Release Tag Examples

### ✅ Stable Release Tags (Will Publish as Stable)
- `v1.4.1` - Stable with v prefix
- `1.4.1` - Stable without v prefix
- `v2.0.0` - Major version stable

### ✅ Pre-release Tags (Will Publish as Pre-release)
- `v1.4.1-alpha` - Alpha with v prefix
- `1.4.1-beta` - Beta without v prefix
- `v2.0.0-rc` - Release candidate
- `1.5.0-test` - Test release
- `v1.4.1-rc.1` - Release candidate with number
- `1.4.1-dev` - Development release
- `v1.4.1-preview` - Preview release

### ❌ Invalid Tags (Build Only, No Publish)
- `nightly-build` - Not semver format
- `feature-xyz` - Not semver format
- `test` - Not semver format

## Best Practices

1. **Use proper tags** for releases:
   - Stable releases: `v1.4.1` or `1.4.1` (no suffix)
   - Pre-releases: `v1.4.1-beta`, `1.4.1-alpha`, `v1.4.1-rc.1` (with suffix)
2. **Bump versions** before creating tags
3. **Update CHANGELOGs** for all affected packages
4. **Test locally** with `npm run build` and `npm run test:unit`
5. **Test release pipeline** using manual trigger before creating actual tag
6. **Tag format requirements**:
   - Stable: `v?X.Y.Z` where X, Y, Z are numbers
   - Pre-release: `v?X.Y.Z-<suffix>` where suffix can be anything
   - With or without `v` prefix: both `v1.4.1` and `1.4.1` work
7. **Manual trigger usage**: Test specific tag builds without publishing

## Troubleshooting

### Tag Format
- **Stable releases**: Use `v?X.Y.Z` (e.g., `v1.4.1`, `1.4.1`)
- **Pre-releases**: Use `v?X.Y.Z-<suffix>` (e.g., `v1.4.1-beta`, `1.4.1-alpha`)
- Both formats with and without `v` prefix are supported

### Testing Release Pipeline
- **Manual Trigger**: Go to Actions → Release → Run workflow
- **Input**: Enter tag like `v1.4.1-test` or `v1.4.1`
- **Result**: Builds and tests, produces VSIX artifact, but doesn't publish
- **Use Case**: Test release process before creating actual tag

### Version Already Exists on Marketplace
- The workflow checks the Marketplace before publishing
- If version exists, publishing is skipped with a warning
- You need to bump the version to publish

### Tag vs package.json Mismatch
- Tag version (e.g., `1.4.1` from `1.4.1-beta` or `v1.4.1`) must match package.json
- Use `bash scripts/bump-version.sh X.Y.Z` to update all packages
- Commit version changes before creating tag

### Dry-run Mode
- Master branch pushes trigger dry-run mode
- Manual triggers always use dry-run mode
- This validates the release pipeline without publishing
- Useful for testing release workflow changes
- Produces downloadable VSIX artifacts with longer retention (30 days)


## Project Structure

This is a monorepo containing three packages:

1. **@cc-format/core** - Core formatting engine (published to npm)
2. **cc-format** - CLI tool (published to npm)
3. **clion-cmake-format** - VS Code extension (published to VS Code Marketplace)

## CI Workflow

**Trigger**: Push to `main`/`master` or pull requests

**Purpose**: Validate code quality across all packages

### Jobs

#### 1. Build Job (Multi-version Node.js)
- **Node versions**: 18.x, 20.x, 22.x, 23.x
- **Steps**:
  - Install dependencies
  - Verify symlinks
  - Build all packages (core, cli, vscode)
  - Run linter
  - Run unit tests
  - Test core package exports
  - Test CLI functionality (version, help, stdin)
  - Build VSIX (Node 22.x only)
  - Upload VSIX artifact (7-day retention)

#### 2. CLI Cross-platform Job
- **Platforms**: Ubuntu, Windows, macOS
- **Node version**: 22.x
- **Purpose**: Ensure CLI works across all major operating systems
- **Tests**:
  - Version check
  - Help command
  - Stdin formatting
  - File formatting

## Release Workflow

**Triggers**:
- Tag push `v?X.Y.Z` (e.g., `v1.4.1`, `1.4.1`) - Stable release
- Tag push `v?X.Y.Z-<suffix>` (e.g., `v1.4.1-beta`, `1.4.1-alpha`) - Pre-release
- Manual trigger via workflow_dispatch (always dry-run)
- Master branch push (always dry-run)

**Purpose**: Publish packages and create releases

### Release Types

1. **Stable Release** (e.g., `v1.4.1`, `1.4.1`)
   - Publishes to VS Code Marketplace as **stable**
   - Creates GitHub Release (NOT marked as pre-release)
   - Format: `v?X.Y.Z` where X, Y, Z are numbers
   - With or without `v` prefix

2. **Pre-release** (e.g., `v1.4.1-alpha`, `1.4.1-beta`, `1.4.1-rc.1`)
   - Publishes to VS Code Marketplace as **pre-release**
   - Creates GitHub Release marked as pre-release
   - Format: `v?X.Y.Z-<suffix>` where suffix can be anything (alpha, beta, test, rc, etc.)
   - With or without `v` prefix

3. **Manual Trigger** (workflow_dispatch)
   - Can input any tag (e.g., `v1.4.1`, `v1.4.1-beta`)
   - Always runs in dry-run mode - NEVER publishes
   - Builds, tests, and uploads VSIX as artifact
   - Useful for testing specific tag builds

4. **Master Branch Push** (automatic)
   - Triggered on every push to master branch
   - Always runs in dry-run mode
   - Uses version from package.json
   - Produces VSIX artifact with 30-day retention

### Validation Steps

1. **Tag Format**: Validates semver pattern
2. **Version Consistency**: Tag must match package.json version
3. **Marketplace Check**: Prevents duplicate version publishing
4. **Build & Test**: Compiles, lints, and runs all tests

### Release Notes Generation

The workflow automatically generates comprehensive release notes including:

#### 📦 VS Code Extension
- Installation instructions
- Marketplace link
- Changes from `packages/vscode/CHANGELOG.md`

#### 🔧 CLI Tool
- npm installation instructions
- Usage examples
- Changes from `packages/cli/CHANGELOG.md`

#### 📚 Core Library
- npm installation instructions
- Changes from `packages/core/CHANGELOG.md`

### Publishing Flow

```
Tag push (e.g., v1.4.1-beta)
  ↓
Validate tag format (must match v?X.Y.Z-(alpha|beta|test|rc))
  ↓
  ├─ Match → Continue to publish
  └─ No match → Build & test only, upload artifact
  ↓
Build all packages
  ↓
Run tests
  ↓
Check VS Code Marketplace (skip if version exists)
  ↓
Publish to Marketplace as pre-release
  ↓
Generate release notes (includes all 3 packages)
  ↓
Create GitHub Release marked as pre-release (with VSIX file)
```

### Manual Trigger Flow

```
Manual workflow dispatch (input tag: v1.4.1-beta)
  ↓
Always set to dry-run mode
  ↓
Build all packages
  ↓
Run tests
  ↓
Upload VSIX as artifact (30-day retention)
  ↓
NO publishing, NO GitHub Release
```

## Distribution Channels

| Package | Distribution | Installation |
|---------|-------------|--------------|
| **VS Code Extension** | VS Code Marketplace + GitHub Release | Install from Marketplace or download VSIX |
| **CLI Tool** | npm only | `npm install -g cc-format` |
| **Core Library** | npm only | `npm install @cc-format/core` |

### Why CLI is NOT in GitHub Release Assets

The CLI tool (`cc-format`) is distributed exclusively through npm because:

1. **Standard Distribution**: npm is the standard distribution channel for Node.js CLI tools
2. **Easy Installation**: Users can install with `npm install -g cc-format` or `npx cc-format`
3. **Automatic Updates**: npm handles version management and updates
4. **Cross-platform**: npm handles platform-specific installations automatically
5. **No Duplication**: GitHub Release is reserved for VS Code extension VSIX files

**Release Notes Still Include CLI**: The GitHub Release notes document all changes to CLI and core packages, with links to npm installation.

## Version Management

All three packages maintain synchronized versions:
- Root `package.json`: `1.4.1`
- `packages/core/package.json`: `1.4.1`
- `packages/cli/package.json`: `1.4.1`
- `packages/vscode/package.json`: `1.4.1`

Use the version management scripts:
```bash
# Bump version across all packages
bash scripts/bump-version.sh 1.5.0

# Check version consistency
bash scripts/check-versions.sh
```

## Manual Publishing

If you need to publish packages manually:

### VS Code Extension
```bash
npm run publish:vscode
```

### CLI Tool (to npm)
```bash
npm run publish:cli
```

### Core Library (to npm)
```bash
npm run publish:core
```

Or use the monorepo publish script:
```bash
bash scripts/publish-monorepo.sh
```

## Troubleshooting
Use pre-release tags** for actual releases: `v1.4.1-beta`, `v1.4.1-alpha`, `v1.4.1-test`, `v1.4.1-rc.1`
2. *Tag Format Rejected
- **Problem**: Tag doesn't trigger publishing
- **Solution**: Ensure tag matches `v?{X}.{Y}.{Z}-(alpha|beta|test|rc)` pattern
- **Examples**: `v1.4.1-beta`, `1.4.1-alpha`, `v2.0.0-rc.1`

### Testing Release Pipeline
- **Manual Trigger**: Go to Actions → Release → Run workflow
- **Input**: Enter tag like `v1.4.1-test`
- **Result**: Builds and tests, produces VSIX artifact, but doesn't publish
- **Use Case**: Test release process before creating actual tag

### *Bump versions** before creating tags
3. **Update CHANGELOGs** for all affected packages
4. **Test locally** with `npm run build` and `npm run test:unit`
5. **Test release pipeline** using manual trigger before creating actual tag
6. **Tag format requirements**:
   - Must match: `v?{X}.{Y}.{Z}-(alpha|beta|test|rc)` where X, Y, Z are numbers
   - With or without `v` prefix: both `v1.4.1-beta` and `1.4.1-beta` work
   - Suffix must be one of: `alpha`, `beta`, `test`, `rc` (can have additional parts like `rc.1`)
7. **Manual trigger usage**: Test specific tag builds without publishing

## Release Tag Examples

### ✅ Valid Release Tags (Will Publish)
- `v1.4.1-alpha` - Pre-release with v prefix
- `1.4.1-beta` - Pre-release without v prefix
- `v2.0.0-rc` - Release candidate
- `1.5.0-test` - Test release
- `v1.4.1-rc.1` - Release candidate with number

### ❌ Invalid Release Tags (Build Only, No Publish)
- `v1.4.1` - Stable version (no suffix)
- `1.4.1` - Stable version
- `v1.4.1-preview` - Wrong suffix
- `1.4.1-dev` - Wrong suffix
- `nightly-build` - Not semver format
### Tag vs package.json Mismatch
- Tag version (e.g., `1.4.1` from `1.4.1-beta`) must match package.json
- Use `bash scripts/bump-version.sh X.Y.Z` to update all packages
- Commit version changes before creating tag

### Dry-run Mode
- Master branch pushes trigger dry-run mode
- This validates the release pipeline without publishing
- Useful for testing release workflow changes
- Produces downloadable VSIX artifacts with longer retention (30 days)

## Best Practices

1. **Bump versions** before creating tags
2. **Update CHANGELOGs** for all affected packages
3. **Test locally** with `npm run build` and `npm run test:unit`
4. **Use semantic versioning** (MAJOR.MINOR.PATCH)
5. **Tag format**: Use `v1.4.1` or `1.4.1` (both work)
6. **Pre-releases**: Use suffixes like `-alpha`, `-beta`, `-rc.1`
