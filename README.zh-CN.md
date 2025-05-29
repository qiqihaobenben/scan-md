# scan-md

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
npm install -g scan-md
```

### 本地安装

```bash
npm install scan-md
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
# 按父目录组织
scan-md -d ./docs -p

# 自定义嵌套深度（用于多级目录）
scan-md -d ./content -p --depth 2
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

| 选项           | 别名 | 描述                      | 默认值           |
| -------------- | ---- | ------------------------- | ---------------- |
| `--dir`        | `-d` | 要扫描的目录              | 当前目录         |
| `--output`     | `-o` | 输出文件路径              | （输出到控制台） |
| `--format`     | `-f` | 输出格式（`json`或`yml`） | `json`           |
| `--parent-tag` | `-p` | 按父目录组织              | `false`          |
| `--ignore`     |      | 要忽略的 glob 模式        | `[]`             |
| `--pretty`     |      | 美化 JSON 输出            | `false`          |
| `--depth`      |      | 目录嵌套深度              | `1`              |

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

### 使用父目录标签（深度为 1）

```json
{
  "java": [
    {
      "path": "java/basic.md",
      "title": "Java 基础"
    }
  ],
  "python": [
    {
      "path": "python/start.md",
      "title": "Python 入门"
    }
  ]
}
```

### 使用父目录标签（深度为 2）

```json
{
  "java": {
    "advanced": [
      {
        "path": "java/advanced/concurrency.md",
        "title": "Java 并发"
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
