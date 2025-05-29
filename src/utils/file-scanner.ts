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
  if (data.title && typeof data.title === 'string') {
    return data.title
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
  const result: GroupedResult = {}

  for (const entry of entries) {
    const pathParts = entry.path.split(path.sep)

    // Skip files in the root directory if they don't have parent directories
    if (pathParts.length <= 1) {
      const rootKey = '_root'
      result[rootKey] = result[rootKey] || []
      ;(result[rootKey] as IMarkdownEntry[]).push(entry)
      continue
    }

    // Extract parent directories up to the specified depth
    const dirDepth = Math.min(depth, pathParts.length - 1)
    const dirs = pathParts.slice(0, dirDepth)

    // For single-level grouping
    if (depth === 1) {
      const dir = dirs[0]
      result[dir] = result[dir] || []
      ;(result[dir] as IMarkdownEntry[]).push(entry)
    }
    // For multi-level grouping
    else {
      let current = result

      // Navigate through the directory hierarchy
      for (let i = 0; i < dirs.length - 1; i++) {
        const dir = dirs[i]
        current[dir] = current[dir] || {}
        current = current[dir] as Record<string, any>
      }

      // Add the entry to the deepest level
      const lastDir = dirs[dirs.length - 1]
      current[lastDir] = current[lastDir] || []
      ;(current[lastDir] as IMarkdownEntry[]).push(entry)
    }
  }

  return result
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
