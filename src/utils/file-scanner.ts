import fs from 'fs/promises'
import path from 'path'
import glob from 'fast-glob'
import matter from 'gray-matter'
import { z } from 'zod'
import type { IMarkdownEntry, FlatResult, GroupedResult, ScanResult } from '../types/index.js'

/**
 * Schema for file scan options
 */
const fileScanOptionsSchema = z.object({
  dir: z.string().default(process.cwd()),
  ignore: z.array(z.string()).default([]),
  depth: z.number().int().positive().default(1),
})

/**
 * File scan options
 */
export interface IFileScanOptions {
  dir: string
  ignore: string[]
  depth: number
}

/**
 * Extract title from markdown content
 * @param content Markdown content
 * @param filePath File path for fallback title
 * @returns Extracted title
 */
export async function extractTitle(content: string, filePath: string): Promise<string> {
  // Try to extract from front matter
  const { data } = matter(content)
  if (data['title'] && typeof data['title'] === 'string') {
    return data['title']
  }

  // Try to extract first h1 heading
  const h1Match = content.match(/^#\s+(.*)$/m)
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim()
  }

  // Fallback to filename (without extension)
  const basename = path.basename(filePath, path.extname(filePath))
  return basename
}

/**
 * Scan directory for markdown files
 * @param options Scan options
 * @returns List of markdown files with extracted titles
 */
export async function scanMarkdownFiles(options: IFileScanOptions): Promise<FlatResult> {
  // Validate options
  const validatedOptions = fileScanOptionsSchema.parse(options)

  // Find all markdown files
  const patterns = ['**/*.md']
  const files = await glob(patterns, {
    cwd: validatedOptions.dir,
    ignore: validatedOptions.ignore,
    absolute: false,
    onlyFiles: true,
    markDirectories: false,
  })

  // Process each file
  const result: FlatResult = []

  for (const file of files) {
    try {
      const filePath = path.join(validatedOptions.dir, file)
      const content = await fs.readFile(filePath, 'utf-8')
      const title = await extractTitle(content, file)

      result.push({
        path: file,
        title,
      })
    } catch (error) {
      console.error(`Error processing file ${file}:`, error)
    }
  }

  return result
}

/**
 * Group results by parent directory
 * @param entries Flat list of markdown entries
 * @param depth Directory nesting depth
 * @returns Grouped result
 */
export function groupByParentDirectory(entries: FlatResult, depth: number): GroupedResult {
  // 创建根节点
  const root: IMarkdownEntry[] = []

  // 用于快速查找已创建的目录节点
  const dirMap: Record<string, IMarkdownEntry> = {}

  // 处理每个文件条目
  for (const entry of entries) {
    const pathParts = entry.path.split(path.sep)
    const fileName = pathParts[pathParts.length - 1]

    // 如果文件在根目录
    if (pathParts.length === 1 || depth === 1) {
      if (depth === 1) {
        root.push({
          ...entry,
        })
      } else {
        root.push({
          ...entry,
          parent: '',
          children: [],
        })
      }
      continue
    }

    // 获取目录路径部分（限制到指定深度）
    const dirDepth = Math.min(depth, pathParts.length - 1)
    const dirs = pathParts.slice(0, dirDepth)

    // 当前处理的目录路径
    let currentPath = ''
    let parentPath = ''
    let currentNode: IMarkdownEntry | null = null

    // 逐级创建或获取目录节点
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i]
      if (!dir) {
        continue
      }

      // 更新路径
      if (currentPath) {
        parentPath = currentPath
        currentPath = `${currentPath}/${dir}`
      } else {
        currentPath = dir
        parentPath = ''
      }

      // 检查此目录节点是否已存在
      if (!dirMap[currentPath]) {
        // 创建新的目录节点
        const dirNode: IMarkdownEntry = {
          path: currentPath,
          title: dir || '',
          parent: parentPath,
          children: [],
        }

        // 将节点加入映射表
        dirMap[currentPath] = dirNode

        // 将节点添加到父节点的子节点列表
        if (parentPath) {
          dirMap[parentPath]?.children?.push(dirNode)
        } else {
          // 顶级目录直接加入根节点
          root.push(dirNode)
        }
      }

      currentNode = dirMap[currentPath] || null
    }

    // 将文件添加到其直接父目录节点的子节点
    if (currentNode && currentNode.children) {
      currentNode.children.push({
        ...entry,
        parent: currentPath,
      })
    }
  }

  return root
}

/**
 * Process markdown files and organize results
 * @param options Scan options
 * @param useParentTag Whether to group by parent directory
 * @returns Scan result
 */
export async function processMarkdownFiles(options: IFileScanOptions, useParentTag: boolean): Promise<ScanResult> {
  const entries = await scanMarkdownFiles(options)

  if (useParentTag) {
    return groupByParentDirectory(entries, options.depth)
  }

  return entries
}
