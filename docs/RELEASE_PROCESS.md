# Release Process

This document describes the automated release workflow for the clion-cmake-format extension.

## Overview

The release workflow is configured in `.github/workflows/release.yml` and supports:
- ✅ Automated VS Code Marketplace publishing
- ✅ GitHub Release creation
- ✅ Pre-release support (alpha, beta, rc)
- ✅ Dry-run mode for testing
- ✅ Version validation

## Release Types

### Stable Release
Tag format: `X.Y.Z` (e.g., `1.3.0`, `2.0.0`)
- Published as a stable release to VS Code Marketplace
- Creates a non-prerelease GitHub Release

### Pre-release
Tag format: `X.Y.Z-suffix` (e.g., `1.3.0-alpha`, `1.3.0-beta`, `1.3.0-rc.1`)
- Published as a pre-release to VS Code Marketplace
- Creates a prerelease GitHub Release

## How to Release

### Prerequisites
1. Ensure `MS_STORE_TOKEN` secret is configured in GitHub repository settings
   - This is the Visual Studio Marketplace Personal Access Token (PAT)
   - Required permissions: "Marketplace (Publish)"
2. Ensure `package.json` version is updated to the target version
3. All tests must pass on the master branch

### Steps

1. **Update Version** (if not already done)
   ```bash
   # Edit package.json and update the version field
   git add package.json
   git commit -m "Bump version to X.Y.Z"
   git push origin master
   ```

2. **Create and Push Tag**
   ```bash
   # For stable release
   git tag X.Y.Z
   git push origin X.Y.Z
   
   # For pre-release
   git tag X.Y.Z-alpha
   git push origin X.Y.Z-alpha
   ```

3. **Automated Process**
   The workflow will automatically:
   - ✅ Validate tag format
   - ✅ Check version consistency with package.json
   - ✅ Build and test the extension
   - ✅ Check if version already exists in Marketplace
   - ✅ Publish to VS Code Marketplace (if version doesn't exist)
   - ✅ Create GitHub Release with VSIX file

## Dry-Run Mode

To test the release workflow without publishing:

```bash
# Push to master branch (no tag)
git push origin master
```

This will:
- Run all build and test steps
- Validate version format
- Check if version exists in Marketplace
- Upload VSIX as a GitHub Actions artifact (30-day retention)
- **Not** publish to Marketplace or create a GitHub Release

## Version Validation

The workflow enforces these rules:
- Tag version must match `package.json` version (for stable releases)
- Tag must follow semantic versioning: `X.Y.Z` or `X.Y.Z-suffix`
- Version must not already exist in VS Code Marketplace

## Secrets Required

### MS_STORE_TOKEN
- **Description**: Visual Studio Marketplace Personal Access Token
- **How to generate**:
  1. Go to https://dev.azure.com/
  2. Create a PAT with "Marketplace (Publish)" permission
  3. Add as repository secret in GitHub Settings > Secrets and variables > Actions
- **Used for**: Publishing extension to VS Code Marketplace

## Troubleshooting

### Version Already Exists
If the version already exists in the Marketplace:
- The workflow will skip publishing
- A warning will be displayed
- GitHub Release will still be created

### Version Mismatch
If tag version doesn't match `package.json`:
- The workflow will fail with an error
- Update `package.json` and push the change
- Delete and recreate the tag

### Build or Test Failure
If build or tests fail:
- The workflow stops before publishing
- Fix the issue on master branch
- Delete the tag: `git push --delete origin X.Y.Z`
- Push fixes and recreate the tag

## Workflow Features

### Version Check
- Automatically checks if version exists in Marketplace before publishing
- Prevents accidental duplicate releases

### Pre-release Support
- Tags with suffixes (e.g., `-alpha`, `-beta`) are published as pre-releases
- Pre-releases are marked appropriately in both Marketplace and GitHub

### Error Handling
- Continue-on-error for marketplace checks
- Detailed error messages for failures
- Output files captured for debugging

### Artifact Retention
- Dry-run mode: VSIX stored for 30 days
- Release mode: VSIX attached to GitHub Release permanently

## Example Releases

```bash
# Stable release 1.3.0
git tag 1.3.0
git push origin 1.3.0

# Alpha pre-release
git tag 1.4.0-alpha
git push origin 1.4.0-alpha

# Beta pre-release
git tag 1.4.0-beta.1
git push origin 1.4.0-beta.1

# Release candidate
git tag 1.4.0-rc.1
git push origin 1.4.0-rc.1
```

## References

- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [GitHub Actions Workflows](https://docs.github.com/en/actions/using-workflows)
- [Semantic Versioning](https://semver.org/)
