import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { extractTitle, groupByParentDirectory } from '../../src/utils/file-scanner.js'
import type { IMarkdownEntry } from '../../src/types/index.js'

describe('extractTitle', () => {
  test('should extract title from first h1 heading', async () => {
    const content = `
# This is a title

Some content here.
    `
    const title = await extractTitle(content, 'file.md')
    expect(title).toBe('This is a title')
  })

  test('should extract title from front matter', async () => {
    const content = `---
title: Front Matter Title
author: Test Author
---

# Different Title

Some content here.
    `
    const title = await extractTitle(content, 'file.md')
    expect(title).toBe('Front Matter Title')
  })

  test('should fallback to filename when no title is found', async () => {
    const content = `
No headings here, just content.
    `
    const title = await extractTitle(content, 'example-file.md')
    expect(title).toBe('example-file')
  })

  test('should handle empty content', async () => {
    const content = ''
    const title = await extractTitle(content, 'empty-file.md')
    expect(title).toBe('empty-file')
  })
})

describe('groupByParentDirectory', () => {
  let entries: IMarkdownEntry[]

  beforeEach(() => {
    entries = [
      { path: 'file1.md', title: 'File 1' },
      { path: 'dir1/file2.md', title: 'File 2' },
      { path: 'dir1/file3.md', title: 'File 3' },
      { path: 'dir2/file4.md', title: 'File 4' },
      { path: 'dir2/subdir/file5.md', title: 'File 5' },
    ]
  })

  test('should group by first level directory', () => {
    const grouped = groupByParentDirectory(entries, 1)

    expect(Array.isArray(grouped)).toBe(true)
    expect(grouped).toHaveLength(5)
  })

  test('should handle depth=2 nesting', () => {
    const grouped = groupByParentDirectory(entries, 2)

    expect(Array.isArray(grouped)).toBe(true)
    expect(grouped).toHaveLength(3)
  })

  test('should handle empty entries', () => {
    const grouped = groupByParentDirectory([], 1)
    expect(Array.isArray(grouped)).toBe(true)
    expect(grouped).toHaveLength(0)
  })
})
