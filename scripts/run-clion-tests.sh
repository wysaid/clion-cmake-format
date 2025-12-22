#!/usr/bin/env bash

#
# CLion Test Runner
#
# This script downloads CLion using Gradle and runs formatting tests.
# It uses the IntelliJ Platform Gradle Plugin to automatically download
# CLion without requiring a local installation.
#
# Usage:
#   ./scripts/run-clion-tests.sh [command] [options]
#
# Commands:
#   download    - Download CLion (first time setup)
#   path        - Print CLion executable path
#   format      - Format files with CLion
#   validate    - Validate datasets with CLion (runs validate-with-clion.js)
#   integration - Run integration tests (npm run test:integration)
#   help        - Show this help message
#
# Options:
#   --target-dir <path>  - Target directory to format (for format command)
#   --verbose            - Enable verbose output
#
# Environment:
#   CLION_PATH  - If set, uses this CLion instead of downloading
#   JAVA_HOME   - Java installation directory (JDK 17+ required)
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLION_TEST_DIR="$PROJECT_ROOT/clion-test"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check Java availability
check_java() {
    if ! command -v java &> /dev/null; then
        if [ -z "$JAVA_HOME" ]; then
            error "Java not found. Please install JDK 17+ or set JAVA_HOME."
        fi
    fi

    # Check Java version
    local java_version
    java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$java_version" -lt 17 ] 2>/dev/null; then
        warning "Java version $java_version detected. JDK 17+ is recommended."
    fi
}

# Verify CLion license by running a simple format test
verify_clion_license() {
    local clion_path="$1"

    info "Verifying CLion license..."

    # Create a test file
    local test_dir=$(mktemp -d)
    local test_file="$test_dir/license_test.cmake"
    echo 'message(   "test"   )' > "$test_file"

    # Try to format it
    local output
    output=$("$clion_path" format -allowDefaults "$test_file" 2>&1)
    local exit_code=$?

    # Check for license error
    if echo "$output" | grep -q "No valid license found"; then
        rm -rf "$test_dir"
        error "CLion license not found or invalid.

The downloaded CLion requires a valid license to run formatting commands.
Options:
  1. Use a locally installed and activated CLion instead:
     export CLION_PATH=/path/to/your/activated/clion

  2. Apply for JetBrains Open Source License:
     https://www.jetbrains.com/community/opensource/

  3. Use a JetBrains floating license server

For CI/CD, you need to configure license activation before running tests."
    fi

    # Verify the file was actually formatted
    local content
    content=$(cat "$test_file")
    if [ "$content" = 'message(   "test"   )' ]; then
        rm -rf "$test_dir"
        warning "CLion formatting may not have executed. Check license status."
        return 1
    fi

    rm -rf "$test_dir"
    success "CLion license verified and formatting works!"
    return 0
}

# Get CLion path from Gradle
get_clion_path() {
    if [ -n "$CLION_PATH" ] && [ -f "$CLION_PATH" ]; then
        echo "$CLION_PATH"
        return 0
    fi

    cd "$CLION_TEST_DIR"
    local output
    output=$(./gradlew -q printClionPath 2>/dev/null | grep "CLION_PATH=" | cut -d'=' -f2)

    if [ -n "$output" ] && [ -f "$output" ]; then
        echo "$output"
        return 0
    fi

    return 1
}

# Download CLion
cmd_download() {
    info "Downloading CLion using Gradle..."
    check_java

    cd "$CLION_TEST_DIR"

    if [ "$VERBOSE" = "true" ]; then
        ./gradlew downloadClion --info
    else
        ./gradlew downloadClion
    fi

    success "CLion downloaded successfully!"

    # Print path
    local clion_path
    clion_path=$(get_clion_path)
    if [ -n "$clion_path" ]; then
        info "CLion path: $clion_path"
    fi
}

# Print CLion path
cmd_path() {
    check_java

    local clion_path
    clion_path=$(get_clion_path)

    if [ -n "$clion_path" ]; then
        echo "$clion_path"
    else
        error "CLion not found. Run './scripts/run-clion-tests.sh download' first."
    fi
}

# Format files with CLion
cmd_format() {
    local target_dir="${TARGET_DIR:-$PROJECT_ROOT/test/datasets/well-formatted/default}"

    check_java

    # Get CLion path
    local clion_path
    clion_path=$(get_clion_path) || true

    if [ -z "$clion_path" ]; then
        info "CLion not found, downloading..."
        cmd_download
        clion_path=$(get_clion_path)
    fi

    if [ -z "$clion_path" ]; then
        error "Failed to get CLion path"
    fi

    info "Formatting with CLion..."
    info "CLion: $clion_path"
    info "Target: $target_dir"

    # Find all CMake files
    local cmake_files
    cmake_files=$(find "$target_dir" -name "*.cmake" -o -name "CMakeLists.txt" 2>/dev/null)

    if [ -z "$cmake_files" ]; then
        warning "No CMake files found in $target_dir"
        return 0
    fi

    local file_count
    file_count=$(echo "$cmake_files" | wc -l)
    info "Found $file_count CMake file(s)"

    # Run CLion format
    # shellcheck disable=SC2086
    "$clion_path" format -allowDefaults $cmake_files

    success "Formatting complete!"
}

# Validate datasets with CLion
cmd_validate() {
    check_java

    # Get CLion path
    local clion_path
    clion_path=$(get_clion_path) || true

    if [ -z "$clion_path" ]; then
        info "CLion not found, downloading..."
        cmd_download
        clion_path=$(get_clion_path)
    fi

    if [ -z "$clion_path" ]; then
        error "Failed to get CLion path"
    fi

    # Verify license before running tests
    verify_clion_license "$clion_path" || exit 1

    info "Running validation with CLion..."
    export CLION_PATH="$clion_path"

    local args=()
    if [ "$VERBOSE" = "true" ]; then
        args+=("--verbose")
    fi
    if [ -n "$TARGET_DIR" ]; then
        args+=("--test-dir" "$TARGET_DIR")
    fi

    node "$PROJECT_ROOT/scripts/validate-with-clion.js" "${args[@]}"
}

# Run integration tests
cmd_integration() {
    check_java

    # Get CLion path
    local clion_path
    clion_path=$(get_clion_path) || true

    if [ -z "$clion_path" ]; then
        info "CLion not found, downloading..."
        cmd_download
        clion_path=$(get_clion_path)
    fi

    if [ -z "$clion_path" ]; then
        error "Failed to get CLion path"
    fi

    # Verify license before running tests
    verify_clion_license "$clion_path" || exit 1

    info "Running integration tests..."
    export CLION_PATH="$clion_path"

    cd "$PROJECT_ROOT"
    npm run test:integration
}

# Show help
cmd_help() {
    cat << 'EOF'
CLion Test Runner

This script downloads CLion using Gradle and runs formatting tests.
It uses the IntelliJ Platform Gradle Plugin to automatically download
CLion without requiring a local installation.

Usage:
  ./scripts/run-clion-tests.sh [command] [options]

Commands:
  download    - Download CLion (first time setup)
  path        - Print CLion executable path
  format      - Format files with CLion
  validate    - Validate datasets with CLion
  integration - Run integration tests
  help        - Show this help message

Options:
  --target-dir <path>  - Target directory to format
  --verbose            - Enable verbose output

Examples:
  # First time: download CLion
  ./scripts/run-clion-tests.sh download

  # Run validation tests
  ./scripts/run-clion-tests.sh validate

  # Run integration tests
  ./scripts/run-clion-tests.sh integration

  # Format specific directory
  ./scripts/run-clion-tests.sh format --target-dir test/datasets/basic

Environment Variables:
  CLION_PATH  - Use existing CLion installation instead of downloading
  JAVA_HOME   - Java installation directory (JDK 17+ required)

Requirements:
  - JDK 17 or higher (for Gradle and CLion)
  - Node.js (for running tests)
  - Git (for diff comparison)

Note:
  The first run will download ~1GB of CLion files.
  Subsequent runs will use the cached version.
EOF
}

# Parse arguments
VERBOSE=false
TARGET_DIR=""
COMMAND="${1:-help}"
shift || true

while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --target-dir)
            TARGET_DIR="$2"
            shift 2
            ;;
        *)
            warning "Unknown option: $1"
            shift
            ;;
    esac
done

# Run command
case $COMMAND in
    download)
        cmd_download
        ;;
    path)
        cmd_path
        ;;
    format)
        cmd_format
        ;;
    validate)
        cmd_validate
        ;;
    integration)
        cmd_integration
        ;;
    help|--help|-h)
        cmd_help
        ;;
    *)
        error "Unknown command: $COMMAND. Use 'help' for usage information."
        ;;
esac
