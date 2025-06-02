# scan-markdown

A command-line tool for scanning Markdown files and generating structured output.

[简体中文](./README.zh-CN.md) | English

## Features

- Recursively scan directories for Markdown files
- Extract titles from Markdown files (first H1 heading or fallback to filename)
- Organize results by parent directory (optional)
- Support multi-level directory nesting
- Output as JSON or YAML format
- Export to file or console

## Installation

### Global Installation

```bash
npm install -g scan-markdown
```

### Local Installation

```bash
npm install scan-markdown
```

## Usage

### Basic Usage

```bash
# Scan current directory
scan-md

# Scan specific directory
scan-md -d ./docs

# Output to file
scan-md -d ./docs -o toc.json

# Output as YAML
scan-md -d ./docs -f yml -o toc.yml
```

### Organizing by Parent Directory

```bash
# Organize by parent directory (flat mode)
scan-md -d ./docs -p flat

# Organize by parent directory with tree structure
scan-md -d ./docs -p tree

# Same as -p flat (backward compatibility)
scan-md -d ./docs -p
```

### Ignoring Files or Directories

```bash
# Ignore specific patterns
scan-md -d ./content --ignore "**/drafts/**" "temp.md"
```

### Prettifying Output

```bash
# Pretty-print JSON output
scan-md -d ./docs --pretty
```

## Command-Line Options

| Option         | Alias | Description                          | Default             |
| -------------- | ----- | ------------------------------------ | ------------------- |
| `--dir`        | `-d`  | Directory to scan                    | Current directory   |
| `--output`     | `-o`  | Output file path                     | (prints to console) |
| `--format`     | `-f`  | Output format (`json` or `yml`)      | `json`              |
| `--parent-tag` | `-p`  | Organization mode (`flat` or `tree`) | `false`             |
| `--ignore`     |       | Glob patterns to ignore              | `[]`                |
| `--pretty`     |       | Prettify JSON output                 | `false`             |

## Output Examples

### Without Parent Tag

```json
[
  {
    "path": "java/basic.md",
    "title": "Java Basics"
  },
  {
    "path": "python/start.md",
    "title": "Python Getting Started"
  }
]
```

### With Parent Tag (flat mode)

```json
{
  "java": [
    {
      "path": "java/basic.md",
      "title": "Java Basics"
    }
  ],
  "python": [
    {
      "path": "python/start.md",
      "title": "Python Getting Started"
    }
  ]
}
```

### With Parent Tag (tree mode)

```json
{
  "java": {
    "advanced": [
      {
        "path": "java/advanced/concurrency.md",
        "title": "Java Concurrency"
      }
    ]
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run locally
npm start -- -d ./docs -p

# Run tests
npm test
```

## License

MIT
