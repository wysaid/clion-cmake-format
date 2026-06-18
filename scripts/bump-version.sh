#!/bin/bash

# Unified version bump script for clion-cmake-format monorepo
# Updates all packages to the same version

set -e

cd "$(dirname "$0")/.."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Error: Version number required${NC}"
    echo ""
    echo "Usage: $0 <new-version>"
    echo ""
    echo "Examples:"
    echo "  $0 1.5.0           # Bump to 1.5.0"
    echo "  $0 1.4.1           # Patch release"
    echo "  $0 1.6.0           # Minor release"
    echo ""
    echo "Note: VS Code extensions only support major.minor.patch format."
    echo "For pre-release versions, use the same version number but publish with --pre-release flag."
    exit 1
fi

NEW_VERSION="$1"

# Validate version format (VS Code only supports major.minor.patch)
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}Error: Invalid version format: $NEW_VERSION${NC}"
    echo "Expected format: X.Y.Z (e.g., 1.5.0)"
    echo ""
    echo "Note: VS Code extensions do not support semver pre-release tags (e.g., 1.5.0-beta.1)."
    echo "Use --pre-release flag when publishing instead:"
    echo "  ./scripts/publish.sh --vsc -p"
    exit 1
fi

# Get current versions
ROOT_VERSION=$(node -p "require('./package.json').version")
CORE_VERSION=$(node -p "require('./packages/core/package.json').version")
CLI_VERSION=$(node -p "require('./packages/cli/package.json').version")
VSC_VERSION=$(node -p "require('./packages/vscode/package.json').version")

echo -e "${BLUE}Unified Version Bump${NC}"
echo ""
echo "Current versions:"
echo "  Root:               $ROOT_VERSION"
echo "  @cc-format/core:    $CORE_VERSION"
echo "  cc-format:          $CLI_VERSION"
echo "  clion-cmake-format: $VSC_VERSION"
echo ""
echo "New version for all: $NEW_VERSION"
echo ""

# Check if versions are already unified
if [ "$ROOT_VERSION" != "$CORE_VERSION" ] || [ "$ROOT_VERSION" != "$CLI_VERSION" ] || [ "$ROOT_VERSION" != "$VSC_VERSION" ]; then
    echo -e "${YELLOW}Warning: Current versions are not unified${NC}"
fi

# Ask for confirmation
read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo -e "${BLUE}Updating all packages to $NEW_VERSION...${NC}"
echo ""

# Update root
echo "Updating root package..."
npm pkg set version="$NEW_VERSION"
echo -e "${GREEN}✓${NC} Updated package.json"

# Update workspace packages
# This is a pnpm workspace (see pnpm-workspace.yaml). The root package.json has no
# npm "workspaces" field, so `npm pkg set -w <name>` does NOT work here. Instead run
# `npm pkg set` inside each package via `pnpm --filter <pkg> exec`.
echo "Updating @cc-format/core..."
pnpm --filter @cc-format/core exec npm pkg set version="$NEW_VERSION"
echo -e "${GREEN}✓${NC} Updated packages/core/package.json"

echo "Updating cc-format (CLI)..."
pnpm --filter cc-format exec npm pkg set version="$NEW_VERSION"
echo -e "${GREEN}✓${NC} Updated packages/cli/package.json"

echo "Updating clion-cmake-format (VS Code)..."
pnpm --filter clion-cmake-format exec npm pkg set version="$NEW_VERSION"
echo -e "${GREEN}✓${NC} Updated packages/vscode/package.json"

# Note: the CLI and VS Code packages depend on @cc-format/core via the `workspace:*`
# protocol. Do NOT pin it to a fixed version — pnpm resolves `workspace:*` to the local
# package during development and replaces it with the real version automatically on publish.

# Update lockfile
echo ""
echo "Updating pnpm-lock.yaml..."
pnpm install
echo -e "${GREEN}✓${NC} Updated pnpm-lock.yaml"

echo ""
echo -e "${GREEN}Version bump completed!${NC}"
echo ""
echo "All packages are now at version: $NEW_VERSION"
echo ""
echo "Changed files:"
echo "  - package.json"
echo "  - packages/core/package.json"
echo "  - packages/cli/package.json"
echo "  - packages/vscode/package.json"
echo "  - pnpm-lock.yaml"
echo ""
echo "Next steps:"
echo "  1. Update CHANGELOG.md with new version and changes"
echo "  2. Review changes: git diff"
echo "  3. Run tests: pnpm run test:unit"
echo "  4. Commit: git add . && git commit -m \"chore: bump version to ${NEW_VERSION}\""
echo "  5. Publish: ./scripts/publish.sh --cli  (or --vsc)"
