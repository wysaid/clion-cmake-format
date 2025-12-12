# Test Suite Extension Guide

## Background

Currently, `test/datasets/well-formatted/default/` contains 8 test cases. To more comprehensively verify the formatter's idempotency and correctness, we can select more representative test cases from the CMake official test suite.

## CMake Official Test Resources

### Official Repository
- **Main Repository**: https://github.com/Kitware/CMake
- **Test Directory**: https://github.com/Kitware/CMake/tree/master/Tests
- **License**: BSD 3-Clause (compatible with this project)

### Recommended Test Categories

| Category | Path | Description | Suitability |
|----------|------|-------------|-------------|
| Basic Syntax | `Tests/CMakeOnly/` | Pure CMake syntax, no compilation | ⭐⭐⭐⭐⭐ |
| Command Tests | `Tests/RunCMake/` | Tests for various CMake commands | ⭐⭐⭐⭐⭐ |
| Complex Projects | `Tests/Complex/` | Complex project examples | ⭐⭐⭐⭐ |
| Tutorial Examples | `Tests/Tutorial/` | Official tutorial code | ⭐⭐⭐ |
| Real-world Cases | `Tests/CMakeLists.txt` | CMake's own build files | ⭐⭐⭐⭐ |

## Tools

### Method 1: Automatic Selection Script (Recommended)

```bash
# Run Python script to automatically analyze and select test files
python3 scripts/select-cmake-tests.py
```

**Script Features**:
- Automatically clones CMake official repository (sparse checkout, only downloads Tests directory)
- Analyzes complexity and characteristics of all CMake test files
- Selects 20 representative files based on diversity principles
- Copies selected files to `test/datasets/cmake-official/`
- Generates README with selection criteria

**Selection Criteria**:
- **Simple** (5): ≤50 lines, complexity ≤20
- **Medium** (8): 50-200 lines, complexity 20-100
- **Complex** (7): ≥200 lines, complexity ≥100

### Method 2: Manual Selection

```bash
# 1. Clone CMake repository (sparse checkout)
git clone --depth 1 --filter=blob:none --sparse https://github.com/Kitware/CMake.git /tmp/cmake-tests
cd /tmp/cmake-tests
git sparse-checkout set Tests

# 2. Browse and select test files of interest
ls -R Tests/

# 3. Copy to test suite
cp Tests/CMakeOnly/SomeTest/CMakeLists.txt test/datasets/cmake-official/
```

## Integration into Test Suite

### Option A: Separate Test Category

Add a new test category in `test/well-formated.test.ts`:

```typescript
describe('CMake Official Tests', () => {
    const officialDir = path.join(__dirname, 'datasets', 'cmake-official');
    const files = fs.readdirSync(officialDir).filter(f => f.endsWith('.cmake'));

    files.forEach(file => {
        it(`should format ${file} correctly`, () => {
            const content = fs.readFileSync(path.join(officialDir, file), 'utf-8');
            const formatted1 = formatCMake(content, defaultConfig);
            const formatted2 = formatCMake(formatted1, defaultConfig);
            assert.strictEqual(formatted1, formatted2, 'Should be idempotent');
        });
    });
});
```

### Option B: Add to Existing Style

```bash
# Copy selected files to well-formatted/default/
cp test/datasets/cmake-official/interesting-file.cmake \
   test/datasets/well-formatted/default/
```

## Recommended Workflow

### Phase 1: Evaluation and Filtering

1. **Run Automatic Selection Script**
   ```bash
   python3 scripts/select-cmake-tests.py
   ```

2. **Review Selected Files**
   ```bash
   cd test/datasets/cmake-official
   ls -lh
   ```

3. **Manually Test Some Files**
   ```bash
   # Test formatting of a single file
   npm run compile
   node -e "
   const {formatCMake} = require('./dist/src/formatter');
   const fs = require('fs');
   const content = fs.readFileSync('test/datasets/cmake-official/some-file.cmake', 'utf-8');
   const formatted = formatCMake(content, {});
   console.log(formatted);
   "
   ```

### Phase 2: Integration Testing

1. **Create New Test Category**
   ```bash
   # Edit test/well-formated.test.ts
   # Add CMake Official Tests section
   ```

2. **Run Tests**
   ```bash
   npm run test:unit
   ```

3. **Analyze Failed Tests**
   - Record formatter issues
   - Determine if specific files need fixing or exclusion

### Phase 3: Optimization

1. **Exclude Unsuitable Files**
   - Files containing special syntax
   - Files testing error conditions
   - Files that are too complex or special-purpose

2. **Select Most Representative Files**
   - Cover common CMake patterns
   - Include various complexity levels
   - Typical usage from real projects

3. **Document Test Coverage**
   - Update README
   - Document features tested by each file

## Expected Outcomes

- **Current**: 8 well-formatted test cases + 20 CMake official test cases
- **Coverage**:
  - ✅ Basic commands (add_executable, set, etc.)
  - ✅ Control flow (if, foreach, while)
  - ✅ Functions and macros
  - ✅ Multi-line commands
  - ✅ Comment handling
  - ✅ Complex nesting
  - ✅ Real project structures
  - ✅ CMake official test cases (20 representative files selected from 8,899 files)

## Test Results

Run `node scripts/test-cmake-official.js` to verify CMake official test files:

```
✅ Passed: 20/20
❌ Failed: 0/20
⚠️  Errors: 0/20

📊 Statistics:
  - Total lines tested: 6,302
  - Average lines per file: 315
  - Complexity range: 4-2504
```

All official test files passed the idempotency test! ✨

## Important Notes

### ⚠️ Key Principles

1. **Don't Modify Test Data**: Test files should remain as-is, even if they appear "non-standard"
2. **Focus on Idempotency**: The main goal is to verify `format(format(x)) == format(x)`
3. **Document Issues**: If certain files cannot be formatted correctly, document the issue rather than modifying the test data

### 🔍 Exclusion Criteria

The following types of files are not suitable as formatting tests:
- Tests intentionally containing syntax errors
- Files testing specific CMake version features
- Files containing platform-specific syntax
- Files testing error handling

## Reference Resources

- CMake Official Documentation: https://cmake.org/documentation/
- CMake Testing Guide: https://github.com/Kitware/CMake/blob/master/Help/dev/testing.rst
- CMake Syntax Specification: https://cmake.org/cmake/help/latest/manual/cmake-language.7.html

## Update History

- 2025-12-12: Created this guide, provided automatic selection script
