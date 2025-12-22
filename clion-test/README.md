# CLion Test Runner

This directory contains a Gradle project that automatically downloads CLion for running formatting tests. It uses the [IntelliJ Platform Gradle Plugin](https://plugins.jetbrains.com/docs/intellij/tools-intellij-platform-gradle-plugin.html) to download CLion without requiring a local installation.

## ⚠️ License Requirement

**Important**: The downloaded CLion requires a valid license to run formatting commands. Without activation, the `format` command will fail with "No valid license found".

**Options:**
1. Use a locally installed and activated CLion instead
2. Apply for [JetBrains Open Source License](https://www.jetbrains.com/community/opensource/)
3. Use a JetBrains floating license server for CI/CD

## Requirements

- **JDK 17+**: Required for Gradle and the IntelliJ Platform Gradle Plugin
- **Internet connection**: For downloading Gradle and CLion (first run only)
- **CLion License**: Required for formatting commands

## Quick Start

```bash
# Download CLion
./gradlew downloadClion

# Print CLion executable path
./gradlew printClionPath

# Format files with CLion
./gradlew formatWithClion -PtargetDir=/path/to/cmake/files
```

## Available Tasks

| Task | Description |
|------|-------------|
| `downloadClion` | Download CLion IDE to Gradle cache |
| `printClionPath` | Print the path to CLion executable |
| `formatWithClion` | Format CMake files using CLion |

## How It Works

1. **Gradle Wrapper**: The `gradlew` script downloads Gradle automatically
2. **IntelliJ Plugin**: The plugin downloads CLion from JetBrains servers
3. **Caching**: Downloaded files are cached in `~/.gradle/caches/`

## Configuration

The CLion version is configured in `build.gradle.kts`:

```kotlin
intellij {
    version.set("2024.3")  // CLion version
    type.set("CL")         // Type = CLion
}
```

## Cache Locations

- **Gradle**: `~/.gradle/wrapper/dists/`
- **CLion IDE**: `~/.gradle/caches/modules-2/files-2.1/com.jetbrains.intellij.clion/`

## Troubleshooting

### Java Not Found

Install JDK 17 or higher:

```bash
# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# macOS (Homebrew)
brew install openjdk@17

# Or download from https://adoptium.net/
```

### Download Fails

If the download fails, try:

1. Check your internet connection
2. Try again (may be a temporary network issue)
3. Clear Gradle cache: `rm -rf ~/.gradle/caches/modules-2/files-2.1/com.jetbrains.intellij.clion/`

### Disk Space

CLion download requires approximately **1GB** of disk space.

## Files

- `build.gradle.kts` - Gradle build script with CLion configuration
- `settings.gradle.kts` - Gradle settings
- `gradle.properties` - Gradle properties
- `gradlew` / `gradlew.bat` - Gradle wrapper scripts
- `gradle/wrapper/` - Gradle wrapper files
