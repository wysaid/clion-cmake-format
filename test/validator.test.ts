import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { validateDirectory } from '../src/validator';

describe('well-formatted dataset validator', () => {
    it('all files under test/datasets/well-formatted/default should be well formatted', () => {
        const datasetDir = path.join(__dirname, 'datasets', 'well-formatted', 'default');
        assert.ok(fs.existsSync(datasetDir), `dataset dir missing: ${datasetDir}`);

        const results = validateDirectory(datasetDir, path.resolve(__dirname, '..'));

        // Collect failures
        const failures = results.filter(r => !r.ok);

        if (failures.length > 0) {
            const messages = failures.map(f => {
                // Show small diff: first line where differs
                const origLines = f.original.split('\n');
                const fmtLines = f.formatted.split('\n');
                let idx = 0;
                while (idx < origLines.length && idx < fmtLines.length && origLines[idx] === fmtLines[idx]) idx++;
                const origSnippet = origLines.slice(Math.max(0, idx - 2), idx + 2).join('\n');
                const fmtSnippet = fmtLines.slice(Math.max(0, idx - 2), idx + 2).join('\n');
                return `${f.filePath}: ${f.reason}\n--- original snippet ---\n${origSnippet}\n--- formatted snippet ---\n${fmtSnippet}`;
            }).join('\n\n');
            assert.fail(`Found ${failures.length} poorly formatted files:\n${messages}`);
        }
    });
});
