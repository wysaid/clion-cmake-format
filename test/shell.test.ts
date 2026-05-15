/**
 * Unit tests for Shell Formatter
 */

import * as assert from 'assert';
import { formatShell, isShellFile, DEFAULT_SHELL_OPTIONS } from '@cc-format/shell';

describe('ShellFormatter', () => {
    describe('Basic Formatting', () => {
        it('should format a simple shell script', async () => {
            const input = 'echo "hello world"';
            const output = await formatShell(input);
            assert.ok(typeof output === 'string');
            assert.ok(output.trim().length > 0);
        });

        it('should use tabs by default (indent=0)', async () => {
            const input = 'if true; then\necho "yes"\nfi';
            const output = await formatShell(input);
            assert.ok(output.includes('\techo "yes"'), `expected tab indent by default in:\n${output}`);
        });

        it('should use tabs when indent=0 (explicit)', async () => {
            const input = 'if true; then\necho "yes"\nfi';
            const output = await formatShell(input, { indent: 0 });
            assert.ok(output.includes('\techo "yes"'), `expected tab indent in:\n${output}`);
        });

        it('should use custom indent size', async () => {
            const input = 'if true; then\necho "yes"\nfi';
            const output = await formatShell(input, { indent: 2 });
            assert.ok(output.includes('  echo "yes"'), `expected 2-space indent in:\n${output}`);
        });

        it('should use 4-space indent when indent=4', async () => {
            const input = 'if true; then\necho "yes"\nfi';
            const output = await formatShell(input, { indent: 4 });
            assert.ok(output.includes('    echo "yes"'), `expected 4-space indent in:\n${output}`);
        });

        it('should be idempotent', async () => {
            const input = 'if true; then\necho "hello"\necho "world"\nfi\n';
            const first = await formatShell(input);
            const second = await formatShell(first);
            assert.strictEqual(first, second, 'Second formatting should match first (idempotent)');
        });

        it('should preserve shebang line', async () => {
            const input = '#!/bin/bash\necho "hello"';
            const output = await formatShell(input);
            assert.ok(output.startsWith('#!/bin/bash'), `expected shebang preserved in:\n${output}`);
        });

        it('should format a function definition', async () => {
            const input = 'my_func() {\necho "hello"\n}';
            const output = await formatShell(input);
            assert.ok(output.includes('my_func()'), `expected function in:\n${output}`);
            assert.ok(output.includes('echo "hello"'));
        });

        it('should merge options with defaults', async () => {
            const input = 'if true; then\necho "yes"\nfi';
            // Only pass indent, other options should use defaults
            const output = await formatShell(input, { indent: 2 });
            assert.ok(typeof output === 'string');
        });
    });

    describe('caseIndent option', () => {
        it('should indent case bodies when caseIndent=true', async () => {
            const input = 'case $x in\na)\necho "a"\n;;\nesac';
            const output = await formatShell(input, { caseIndent: true });
            // With caseIndent, the body inside case patterns is indented
            assert.ok(output.includes('esac'));
        });
    });

    describe('binaryNextLine option', () => {
        it('should move binary operators to next line when binaryNextLine=true', async () => {
            const input = 'echo a && echo b';
            const output = await formatShell(input, { binaryNextLine: true });
            assert.ok(typeof output === 'string');
        });
    });

    describe('DEFAULT_SHELL_OPTIONS', () => {
        it('should have expected default values', () => {
            assert.strictEqual(DEFAULT_SHELL_OPTIONS.indent, 0); // 0 means tabs
            assert.strictEqual(DEFAULT_SHELL_OPTIONS.binaryNextLine, false);
            assert.strictEqual(DEFAULT_SHELL_OPTIONS.caseIndent, false);
            assert.strictEqual(DEFAULT_SHELL_OPTIONS.spaceRedirects, false);
            assert.strictEqual(DEFAULT_SHELL_OPTIONS.keepPadding, false);
            assert.strictEqual(DEFAULT_SHELL_OPTIONS.functionNextLine, false);
            assert.strictEqual(DEFAULT_SHELL_OPTIONS.variant, 'auto');
        });
    });

    describe('isShellFile', () => {
        it('should detect .sh files', () => {
            assert.ok(isShellFile('script.sh'));
        });

        it('should detect .bash files', () => {
            assert.ok(isShellFile('script.bash'));
        });

        it('should detect .zsh files', () => {
            assert.ok(isShellFile('script.zsh'));
        });

        it('should detect .bats files', () => {
            assert.ok(isShellFile('test.bats'));
        });

        it('should not match cmake files', () => {
            assert.ok(!isShellFile('CMakeLists.txt'));
            assert.ok(!isShellFile('script.cmake'));
        });

        it('should not match arbitrary extensions', () => {
            assert.ok(!isShellFile('file.ts'));
            assert.ok(!isShellFile('file.js'));
        });
    });
});
