# Test Datasets

本目录包含 CLion CMake Formatter 的测试数据集。数据集按功能和场景分类，便于维护和扩展。

## 📁 目录结构

```
datasets/
├── basic/                    # 基础功能测试数据
├── parsing/                  # 解析特定场景
│   ├── control-flow/        # 控制流（if/foreach/while）
│   ├── functions/           # 函数和宏定义
│   └── special-syntax/      # 特殊语法（括号参数/注释）
├── formatting/               # 格式化特定场景
│   ├── indentation/         # 缩进测试
│   ├── spacing/             # 空格测试
│   └── line-length/         # 行长度和多行测试
├── edge-cases/               # 边界情况
└── real-world/               # 真实 CMakeLists.txt 示例
```

## 🎯 如何使用

### 在测试中加载数据集

```typescript
import { loadBasic, loadParsing, loadFormatting, loadEdgeCase, loadRealWorld } from './helpers';

// 加载基础测试数据
const input = loadBasic('simple-command');

// 加载解析测试数据（带子分类）
const input = loadParsing('control-flow', 'if-block');

// 加载格式化测试数据
const input = loadFormatting('indentation', 'nested-blocks');

// 加载边界情况
const input = loadEdgeCase('empty-file');

// 加载真实场景
const input = loadRealWorld('complete-project');
```

### 使用期望输出

对于需要验证格式化输出的测试，可以创建对应的 `.expected.cmake` 文件：

```typescript
import { loadDataset, loadExpected, hasExpected } from './helpers';

const input = loadDataset('formatting', 'indentation', 'simple-block');
const expected = loadExpected('formatting', 'indentation', 'simple-block');

const output = formatCMake(input);
assert.strictEqual(output, expected);
```

## 📝 添加新测试数据

### 1. 选择合适的分类

- `basic/` - 基础的 CMake 命令和语法
- `parsing/` - 测试解析器的特定场景
- `formatting/` - 测试格式化器的特定场景
- `edge-cases/` - 边界情况和异常输入
- `real-world/` - 完整的真实 CMakeLists.txt

### 2. 创建测试文件

文件命名应简洁明了，使用小写字母和连字符：

```
simple-command.cmake
nested-if.cmake
multiline-with-comments.cmake
```

### 3. 可选：创建期望输出

如果需要验证特定的格式化输出，创建对应的 `.expected.cmake` 文件：

```
simple-block.cmake              # 输入
simple-block.expected.cmake     # 期望的格式化输出
```

### 4. 在测试中使用

```typescript
it('should format nested blocks correctly', () => {
    const input = loadFormatting('indentation', 'nested-blocks');
    const output = formatCMake(input);

    // 验证输出...
    assert.ok(output.includes('        message'));
});
```

## 🔍 现有数据集列表

### Basic
- `simple-command.cmake` - 简单的 project 命令
- `multiple-commands.cmake` - 多个命令
- `command-with-args.cmake` - 带多个参数的命令
- `quoted-arguments.cmake` - 引号参数
- `standalone-comment.cmake` - 独立注释
- `trailing-comment.cmake` - 行尾注释
- `uppercase-command.cmake` - 大写命令
- `escaped-chars.cmake` - 转义字符

### Parsing/Control-Flow
- `if-block.cmake` - 基础 if 块
- `nested-if.cmake` - 嵌套 if 块
- `if-elseif-else.cmake` - 完整的条件语句
- `foreach-loop.cmake` - foreach 循环
- `while-loop.cmake` - while 循环

### Parsing/Functions
- `function-def.cmake` - 函数定义
- `macro-def.cmake` - 宏定义

### Parsing/Special-Syntax
- `bracket-arg.cmake` - 括号参数
- `bracket-arg-equals.cmake` - 带等号的括号参数
- `bracket-comment.cmake` - 括号注释

### Formatting/Indentation
- `simple-block.cmake` - 简单块缩进
- `nested-blocks.cmake` - 嵌套块缩进

### Formatting/Spacing
- `uppercase-input.cmake` - 大写输入
- `lowercase-input.cmake` - 小写输入
- `if-spacing.cmake` - if 语句空格
- `foreach-spacing.cmake` - foreach 语句空格

### Formatting/Line-Length
- `long-args.cmake` - 长参数列表
- `multiline-input.cmake` - 多行输入
- `multiline-with-vars.cmake` - 带变量的多行
- `multiline-with-comments.cmake` - 带注释的多行

### Edge-Cases
- `empty-file.cmake` - 空文件
- `whitespace-only.cmake` - 仅空白字符
- `comment-only.cmake` - 仅注释
- `blank-lines.cmake` - 包含空行

### Real-World
- `complete-project.cmake` - 完整的项目示例

## 🚀 最佳实践

1. **保持简洁** - 每个测试文件应专注于一个特定场景
2. **命名清晰** - 文件名应描述测试内容
3. **适当分类** - 将相似的测试放在同一子目录
4. **复用数据** - 同一数据集可用于多个测试
5. **文档化** - 对复杂场景添加注释说明

## 🔄 维护指南

### 更新现有数据集

直接编辑对应的 `.cmake` 文件即可，测试会自动使用更新后的内容。

### 删除过时数据集

删除对应的 `.cmake` 文件，并更新使用该数据集的测试。

### 重构数据集结构

如果需要调整目录结构，记得同步更新：
1. 数据集文件位置
2. `helpers.ts` 中的路径（如有必要）
3. 测试文件中的加载调用

---

通过这种数据驱动的测试方法，我们可以：
- ✅ 更容易地添加和维护测试用例
- ✅ 清晰地组织测试数据
- ✅ 快速定位和修复问题
- ✅ 提高测试覆盖率
