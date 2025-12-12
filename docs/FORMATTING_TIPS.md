# Formatting Tips Feature

## Overview

This extension now provides visual feedback when formatting CMake files, similar to CLion's formatting behavior.

## Features

### 1. No Changes Notification

When you format a file that is already well-formatted, you will see a status bar message:

```text
No changes: content is already well-formatted
```

This helps you quickly understand that the file doesn't need any formatting changes.

### 2. Changed Lines Count

When formatting makes changes to the file, you will see how many lines were affected:

```text
Formatted 9 lines
```

This gives you immediate feedback about the impact of the formatting operation.

## Implementation Details

### Changed Lines Calculation

The extension compares the original text with the formatted text line by line:
- Lines that are added, removed, or modified are counted as changed lines
- Empty lines and whitespace changes are included in the count
- The comparison is done after applying all formatting rules

### Status Bar Display

- Messages are displayed in the status bar for 3 seconds
- If formatting made no changes, a "No changes" message is shown
- If formatting changed the file, the number of changed lines is displayed

## Usage

Simply format your CMake file using any of these methods:
- Right-click in the editor and select "Format Document"
- Use the keyboard shortcut (default: Ctrl+Shift+I on Windows/Linux, Cmd+Shift+I on Mac)
- Run the command "Format Document" from the command palette
- Use the extension command "CLion CMake Format: Format Document"

After formatting, check the status bar at the bottom of the VS Code window for the formatting result.

## Comparison with CLion

This feature is inspired by CLion's formatting feedback:

| Feature | CLion | This Extension |
|---------|-------|----------------|
| No changes message | ✅ | ✅ |
| Changed lines count | ✅ | ✅ |
| Display location | Popup notification | Status bar message |
| Display duration | Persistent until dismissed | 3 seconds |

## Testing

To test this feature:

1. Open a well-formatted CMake file
2. Format it (Ctrl+Shift+I)
3. Observe the "No changes" message

4. Open a poorly formatted CMake file (e.g., `test-formatting-demo.cmake`)
5. Format it
6. Observe the "Formatted X lines" message

## Technical Notes

- The feature works with both document formatting and range formatting
- Line count is calculated before the actual text replacement happens
- The status bar message does not block the formatting operation
- Errors in displaying the notification do not affect the formatting result
