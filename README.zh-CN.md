# scan-markdown

一个用于扫描 Markdown 文件并生成结构化输出的命令行工具。

## 功能特点

- 递归扫描目录中的所有 Markdown 文件
- 从 Markdown 文件中提取标题（首个 H1 标题或使用文件名作为备选）
- 可选择按父目录组织结果
- 支持多级目录嵌套
- 输出为 JSON 或 YAML 格式
- 可输出到文件或控制台

## 安装

### 全局安装

```bash
npm install -g scan-markdown
```

### 本地安装

```bash
npm install scan-markdown
```

## 使用方法

### 基本用法

```bash
# 扫描当前目录
scan-md

# 扫描指定目录
scan-md -d ./docs

# 输出到文件
scan-md -d ./docs -o toc.json

# 输出为YAML格式
scan-md -d ./docs -f yml -o toc.yml
```

### 按父目录组织

```bash
# 按父目录组织 (flat 模式)
scan-md -d ./docs -p flat

# 按父目录组织 (tree 模式)
scan-md -d ./docs -p tree

# 同 -p flat (保持向后兼容性)
scan-md -d ./docs -p
```

### 忽略特定文件或目录

```bash
# 忽略特定模式
scan-md -d ./content --ignore "**/drafts/**" "temp.md"
```

### 美化输出

```bash
# 美化JSON输出
scan-md -d ./docs --pretty
```

## 命令行选项

| 选项           | 别名 | 描述                       | 默认值           |
| -------------- | ---- | -------------------------- | ---------------- |
| `--dir`        | `-d` | 要扫描的目录               | 当前目录         |
| `--output`     | `-o` | 输出文件路径               | （输出到控制台） |
| `--format`     | `-f` | 输出格式（`json`或`yml`）  | `json`           |
| `--parent-tag` | `-p` | 组织模式（`flat`或`tree`） | `false`          |
| `--ignore`     |      | 要忽略的 glob 模式         | `[]`             |
| `--pretty`     |      | 美化 JSON 输出             | `false`          |

## 输出示例

### 不使用父目录标签

```json
[
  {
    "path": "java/basic.md",
    "title": "Java 基础"
  },
  {
    "path": "python/start.md",
    "title": "Python 入门"
  }
]
```

### 使用父目录标签（flat 模式）

```json
{
  "_root": [
    {
      "path": "root.md",
      "title": "Root File"
    }
  ],
  "folder1": [
    {
      "path": "folder1/file1.md",
      "title": "File One"
    }
  ],
  "folder2": [
    {
      "path": "folder2/file2.md",
      "title": "File Two"
    },
    {
      "path": "folder2/file3.md",
      "title": "File Three"
    }
  ]
}
```

### 使用父目录标签（tree 模式）

```json
{
  "_root": [
    {
      "path": "root.md",
      "title": "Root File"
    }
  ],
  "folder1": {
    "subfolder": [
      {
        "path": "folder1/subfolder/file1.md",
        "title": "File One"
      }
    ]
  },
  "folder2": {
    "subfolder": [
      {
        "path": "folder2/subfolder/file2.md",
        "title": "File Two"
      },
      {
        "path": "folder2/subfolder/file3.md",
        "title": "File Three"
      }
    ]
  }
}
```

## 开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 本地运行
npm start -- -d ./docs -p

# 运行测试
npm test
```

## 许可证

MIT
