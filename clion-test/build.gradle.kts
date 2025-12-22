/**
 * CLion Test Runner - Build Script
 *
 * This Gradle build file uses the IntelliJ Platform Gradle Plugin to
 * automatically download CLion for formatting tests. This allows CI/CD
 * pipelines and developers without CLion installed to run integration tests.
 *
 * Usage:
 *   ./gradlew downloadClion     - Download CLion to Gradle cache
 *   ./gradlew printClionPath    - Print the path to CLion executable
 *   ./gradlew formatWithClion   - Run CMake formatting with CLion
 */

plugins {
    id("org.jetbrains.intellij") version "1.17.4"
    kotlin("jvm") version "1.9.24"
}

group = "org.cmake.format.test"
version = "1.0.0"

repositories {
    mavenCentral()
}

// Configure IntelliJ Platform Gradle Plugin to download CLion
intellij {
    // CLion 2023.3 - A stable version for formatting tests
    // Note: Running CLion format command requires a valid activated license.
    // For CI/container environments, use locally installed CLion with GUI activation.
    // See docs/CLION_INTEGRATION_TESTING.md for details.
    version.set("2023.3")
    // Type "CL" = CLion
    type.set("CL")
    // Don't download sources to save time
    downloadSources.set(false)
}

// Helper function to get IDE directory from setupDependencies task
fun getIdeDirectory(): File {
    val setupTask = tasks.named("setupDependencies", org.jetbrains.intellij.tasks.SetupDependenciesTask::class.java).get()
    return setupTask.idea.get().classes
}

// Task to ensure CLion is downloaded
tasks.register("downloadClion") {
    group = "clion"
    description = "Download CLion IDE for formatting tests"

    dependsOn("setupDependencies")

    doLast {
        val ideDir = getIdeDirectory()
        println("✅ CLion downloaded to: $ideDir")
    }
}

// Task to print CLion executable path
tasks.register("printClionPath") {
    group = "clion"
    description = "Print the path to CLion executable"

    dependsOn("setupDependencies")

    doLast {
        val ideDir = getIdeDirectory()
        val os = System.getProperty("os.name").lowercase()

        val executable = when {
            os.contains("mac") -> ideDir.resolve("Contents/MacOS/clion")
            os.contains("win") -> ideDir.resolve("bin/clion64.exe")
            else -> ideDir.resolve("bin/clion.sh")
        }

        // Check if it exists
        if (executable.exists()) {
            println("CLION_PATH=${executable.absolutePath}")
        } else {
            // Try alternative paths
            val alternatives = listOf(
                ideDir.resolve("bin/clion.sh"),
                ideDir.resolve("bin/clion64.exe"),
                ideDir.resolve("Contents/MacOS/clion")
            )
            for (alt in alternatives) {
                if (alt.exists()) {
                    println("CLION_PATH=${alt.absolutePath}")
                    return@doLast
                }
            }
            System.err.println("Warning: CLion executable not found in expected locations")
            println("CLION_DIR=${ideDir.absolutePath}")
        }
    }
}

// Task to format files with CLion
tasks.register("formatWithClion") {
    group = "clion"
    description = "Format CMake files using CLion"

    dependsOn("setupDependencies")

    doLast {
        val ideDir = getIdeDirectory()
        val os = System.getProperty("os.name").lowercase()

        val executable = when {
            os.contains("mac") -> ideDir.resolve("Contents/MacOS/clion")
            os.contains("win") -> ideDir.resolve("bin/clion64.exe")
            else -> ideDir.resolve("bin/clion.sh")
        }

        val targetDir = project.findProperty("targetDir")?.toString()
            ?: project.rootDir.parentFile.resolve("test/datasets/well-formatted/default").absolutePath

        if (!executable.exists()) {
            throw GradleException("CLion executable not found: $executable")
        }

        println("📍 CLion: $executable")
        println("📁 Target: $targetDir")

        // Find all CMake files
        val cmakeFiles = project.fileTree(targetDir) {
            include("**/*.cmake")
            include("**/CMakeLists.txt")
        }.files

        if (cmakeFiles.isEmpty()) {
            println("⚠️ No CMake files found in $targetDir")
            return@doLast
        }

        println("🔧 Formatting ${cmakeFiles.size} files...")

        // Run CLion format command
        val process = ProcessBuilder().apply {
            command(mutableListOf(
                executable.absolutePath,
                "format",
                "-allowDefaults"
            ).apply {
                addAll(cmakeFiles.map { it.absolutePath })
            })
            redirectErrorStream(true)
        }.start()

        val output = process.inputStream.bufferedReader().readText()
        val exitCode = process.waitFor()

        if (output.isNotBlank()) {
            println(output)
        }

        // CLion may return non-zero for warnings
        if (exitCode != 0 && output.contains("Error", ignoreCase = true)) {
            throw GradleException("CLion formatting failed with exit code $exitCode")
        }

        println("✅ Formatting complete!")
    }
}

// Disable unnecessary tasks to speed up operations
tasks.named("buildSearchableOptions") {
    enabled = false
}

tasks.named("patchPluginXml") {
    enabled = false
}

tasks.named("jarSearchableOptions") {
    enabled = false
}

tasks.named("prepareSandbox") {
    enabled = false
}

tasks.named("runIde") {
    enabled = false
}

tasks.named("publishPlugin") {
    enabled = false
}
