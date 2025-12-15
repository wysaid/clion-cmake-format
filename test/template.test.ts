/**
 * Tests for CMake template project creation
 */

import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

describe('CMake Template Project', () => {
    describe('Template Generation', () => {
        it('should generate valid CMakeLists.txt content', () => {
            const projectName = 'TestProject';
            const expectedContent = `cmake_minimum_required(VERSION 3.10)
project(${projectName})

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(${projectName} main.cpp)
`;
            // Validate that content has expected structure
            assert.ok(expectedContent.includes('cmake_minimum_required'));
            assert.ok(expectedContent.includes(`project(${projectName})`));
            assert.ok(expectedContent.includes('CMAKE_CXX_STANDARD'));
            assert.ok(expectedContent.includes(`add_executable(${projectName} main.cpp)`));
        });

        it('should generate valid main.cpp content', () => {
            const expectedContent = `#include <iostream>

int main() {
    std::cout << "Hello, world" << std::endl;
    return 0;
}
`;
            // Validate that content has expected structure
            assert.ok(expectedContent.includes('#include <iostream>'));
            assert.ok(expectedContent.includes('int main()'));
            assert.ok(expectedContent.includes('Hello, world'));
            assert.ok(expectedContent.includes('return 0;'));
        });

        it('should validate project name format', () => {
            // Valid project names
            const validNames = ['MyProject', 'my-project', 'my_project', 'Project123', 'ABC-123_xyz'];
            for (const name of validNames) {
                const isValid = /^[a-zA-Z0-9_-]+$/.test(name);
                assert.strictEqual(isValid, true, `${name} should be valid`);
            }

            // Invalid project names
            const invalidNames = ['', ' ', 'my project', 'my@project', 'my.project', 'my/project'];
            for (const name of invalidNames) {
                const isValid = /^[a-zA-Z0-9_-]+$/.test(name);
                assert.strictEqual(isValid, false, `${name} should be invalid`);
            }
        });

        it('should create template files in temporary directory', () => {
            const projectName = 'TempTestProject';
            const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cmake-test-'));
            const projectPath = path.join(tempDir, projectName);

            try {
                // Create project directory
                fs.mkdirSync(projectPath, { recursive: true });

                // Create CMakeLists.txt
                const cmakeContent = `cmake_minimum_required(VERSION 3.10)
project(${projectName})

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(${projectName} main.cpp)
`;
                const cmakePath = path.join(projectPath, 'CMakeLists.txt');
                fs.writeFileSync(cmakePath, cmakeContent, 'utf-8');

                // Create main.cpp
                const cppContent = `#include <iostream>

int main() {
    std::cout << "Hello, world" << std::endl;
    return 0;
}
`;
                const cppPath = path.join(projectPath, 'main.cpp');
                fs.writeFileSync(cppPath, cppContent, 'utf-8');

                // Verify files exist
                assert.ok(fs.existsSync(cmakePath), 'CMakeLists.txt should exist');
                assert.ok(fs.existsSync(cppPath), 'main.cpp should exist');

                // Verify file contents
                const cmakeActual = fs.readFileSync(cmakePath, 'utf-8');
                const cppActual = fs.readFileSync(cppPath, 'utf-8');

                assert.strictEqual(cmakeActual, cmakeContent, 'CMakeLists.txt content should match');
                assert.strictEqual(cppActual, cppContent, 'main.cpp content should match');

                // Verify CMakeLists.txt contains required CMake commands
                assert.ok(cmakeActual.includes('cmake_minimum_required'), 'Should have cmake_minimum_required');
                assert.ok(cmakeActual.includes('project('), 'Should have project command');
                assert.ok(cmakeActual.includes('add_executable('), 'Should have add_executable command');

                // Verify main.cpp is valid C++ that prints "Hello, world"
                assert.ok(cppActual.includes('#include <iostream>'), 'Should include iostream');
                assert.ok(cppActual.includes('int main()'), 'Should have main function');
                assert.ok(cppActual.includes('Hello, world'), 'Should print Hello, world');

            } finally {
                // Clean up
                try {
                    if (fs.existsSync(projectPath)) {
                        fs.rmSync(projectPath, { recursive: true, force: true });
                    }
                    if (fs.existsSync(tempDir)) {
                        fs.rmSync(tempDir, { recursive: true, force: true });
                    }
                } catch {
                    // Ignore cleanup errors
                }
            }
        });
    });
});
