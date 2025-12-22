/**
 * CLion Test Runner - Settings
 *
 * This project is used to automatically download CLion and run formatting tests.
 * It uses the IntelliJ Platform Gradle Plugin to download CLion without requiring
 * a local installation.
 */

rootProject.name = "clion-test"

// Configure plugin repositories
pluginManagement {
    repositories {
        maven("https://cache-redirector.jetbrains.com/packages.jetbrains.team/maven/p/ij/intellij-plugin-gradle-plugin-repository")
        gradlePluginPortal()
        mavenCentral()
    }
}
