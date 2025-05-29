# `scan-md` 命令行工具设计文档

#### 核心功能

1. **文件扫描**

   - 递归扫描指定目录下的所有 Markdown 文件（`.md` 扩展名）
   - 支持自定义扫描深度（通过 `--depth` 参数）
   - 默认忽略隐藏文件（如 `.git` 目录）

2. **元数据解析**

   - 提取每个 Markdown 文件的 **一级标题**（首个 `#` 标题内容）
   - 若文件无一级标题，则使用文件名（不含扩展名）作为标题
   - 记录文件相对路径（基于扫描根目录）

3. **分类处理**

   - `--parentTag` 参数启用文件夹分类模式
   - 支持多级嵌套分类（如 `java/concurrency/threads.md`）
   - 分类键名自动转换为 camelCase 或 kebab-case（可选）

4. **输出格式**

   ```json
   // 无 parentTag 模式
   [
     {"path": "path/to/file.md", "title": "文档标题"},
     ...
   ]

   // parentTag 模式
   {
     "category1": [
       {"path": "category1/file1.md", "title": "标题1"},
       {"path": "category1/file2.md", "title": "标题2"}
     ],
     "category2": [ ... ]
   }
   ```

5. **输出目标**
   - 控制台直接输出（默认）
   - 本地文件输出（`--output` 参数）
   - 支持 JSON/YAML 格式（`--format json|yaml`）

---

### 扩展功能建议

1. **标题备用策略**

   - `--fallbackTitle`：当一级标题缺失时，可指定备用源：
     - `filename`：使用文件名
     - `frontmatter`：解析 YAML front matter 中的 title 字段
     - `firstHeader`：使用首个任意级别标题

2. **过滤系统**

   - `--exclude`：忽略特定目录/文件（支持 glob 模式）
   - `--include`：白名单过滤（覆盖默认的 `.md` 匹配）
   - `--minSize`：跳过小于指定大小（KB）的文件

3. **元数据增强**

   - `--withMetadata`：附加额外元数据：
     - 文件大小
     - 最后修改时间
     - 字数统计
     - 预估阅读时间

   ```json
   {
     "path": "...",
     "title": "...",
     "meta": {
       "sizeKB": 12.3,
       "modified": "2023-06-15T08:30:00Z",
       "wordCount": 450
     }
   }
   ```

4. **多格式输出**

   - 支持 XML/CSV 输出（`--format xml|csv`）
   - 自定义分隔符（CSV 模式下）

5. **校验与日志**

   - `--validate`：检查死链/重复标题
   - `--verbose`：显示扫描过程日志
   - `--dry-run`：试运行不实际输出文件

6. **路径处理**

   - `--absolutePath`：输出绝对路径
   - `--baseUrl`：为路径添加 URL 前缀（如 `https://example.com/docs/`）
   - `--normalizePath`：统一路径分隔符（Windows→Unix）

7. **国际化**
   - `--locale`：指定标题的转换规则（如中文繁简转换）
   - `--encoding`：指定文件编码（默认 utf8）

---

### 命令行参数设计

| 参数              | 缩写  | 类型     | 默认值     | 描述                         |
| ----------------- | ----- | -------- | ---------- | ---------------------------- |
| `--dir`           | `-d`  | string   | 当前目录   | 扫描目录                     |
| `--output`        | `-o`  | string   | -          | 输出文件路径                 |
| `--format`        | `-f`  | enum     | `json`     | 输出格式 (json/yaml/xml/csv) |
| `--parentTag`     | `-p`  | boolean  | false      | 启用文件夹分类               |
| `--depth`         | `-dp` | number   | Infinity   | 扫描深度                     |
| `--exclude`       | `-e`  | string[] | []         | 忽略的 glob 模式             |
| `--fallbackTitle` | `-ft` | enum     | `filename` | 标题备用策略                 |
| `--withMetadata`  | `-m`  | boolean  | false      | 包含文件元数据               |
| `--verbose`       | `-v`  | boolean  | false      | 显示详细日志                 |

---

### 技术实现要点

1. **依赖包**

   ```json
   "dependencies": {
     "chalk": "^4.1.2",       // 终端着色
     "commander": "^9.4.1",   // 命令行解析
     "fast-glob": "^3.2.12",  // 文件扫描
     "gray-matter": "^4.0.3", // Front matter 解析
     "js-yaml": "^4.1.0",     // YAML 处理
     "markdown-ast": "^0.2.0" // Markdown 解析
   }
   ```

2. **标题解析逻辑**

   ```javascript
   function parseTitle(content) {
     // 尝试从 front matter 获取
     const { data } = matter(content)
     if (data.title) return data.title

     // 使用 AST 解析首个 h1
     const ast = markdownAst(content)
     const h1 = ast.find((node) => node.type === 'heading' && node.depth === 1)
     return h1?.children[0]?.value || null
   }
   ```

3. **多级分类处理**

   ```javascript
   const result = {}
   files.forEach((file) => {
     const segments = file.relativePath.split('/')
     segments.pop() // 移除文件名

     let current = result
     segments.forEach((seg) => {
       current[seg] = current[seg] || {}
       current = current[seg]
     })

     current._files = current._files || []
     current._files.push({ path: file.path, title: file.title })
   })
   ```

---

### 使用示例

```bash
# 基础用法
scan-md -d ./docs

# 生成分类的 YAML 文件
scan-md -d src --parentTag --format yaml -o toc.yml

# 复杂示例
scan-md -d content -p -ft frontmatter -m \
  --exclude "drafts/**" "archive/*.md" \
  --output toc.json
```

---

### 潜在边界情况处理

1. **空目录处理**：返回空对象 `{}` 而非 `null`
2. **符号链接**：添加 `--followSymlinks` 参数控制
3. **大文件处理**：使用流式读取避免内存溢出
4. **文件名冲突**：在分类模式下自动追加序号（如 `api-v2`）
5. **特殊字符**：YAML/JSON 输出时的 Unicode 转义处理
