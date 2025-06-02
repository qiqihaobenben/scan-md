import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { formatAsJson, formatAsYaml, formatResult } from '../../src/utils/output-formatter.js'
import type { FlatResult, GroupedResult } from '../../src/types/index.js'

describe('formatAsJson', () => {
  test('should format as JSON with pretty print', () => {
    const data: FlatResult = [
      { path: 'file1.md', title: 'Title 1' },
      { path: 'file2.md', title: 'Title 2' },
    ]

    const result = formatAsJson(data, true)
    expect(result).toContain('{\n')
    expect(result).toContain('  "path":')
    expect(JSON.parse(result)).toEqual(data)
  })

  test('should format as JSON without pretty print', () => {
    const data: FlatResult = [
      { path: 'file1.md', title: 'Title 1' },
      { path: 'file2.md', title: 'Title 2' },
    ]

    const result = formatAsJson(data, false)
    expect(result).not.toContain('\n')
    expect(JSON.parse(result)).toEqual(data)
  })
})

describe('formatAsYaml', () => {
  test('should format as YAML', () => {
    const data: GroupedResult = [
      { path: 'root.md', title: 'Root File', parent: '', children: [] },
      {
        path: 'folder1',
        title: 'folder1',
        parent: '',
        children: [
          { path: 'folder1/file1.md', title: 'Title 1' },
          { path: 'folder1/file2.md', title: 'Title 2' },
        ],
      },
      {
        path: 'folder2',
        title: 'folder2',
        parent: '',
        children: [
          { path: 'folder2/file4.md', title: 'Title 1' },
          { path: 'folder2/file5.md', title: 'Title 2' },
        ],
      },
    ]

    const result = formatAsYaml(data)
    expect(result).toContain('  - path:')
    expect(result).toContain('    title:')
  })
})

describe('formatResult', () => {
  test('should use JSON formatter when format is json', () => {
    const data: FlatResult = [{ path: 'file1.md', title: 'Title 1' }]

    const options = {
      format: 'json' as const,
      pretty: true,
    }

    const result = formatResult(data, options)
    expect(result).toContain('{\n')
    expect(JSON.parse(result)).toEqual(data)
  })

  test('should use YAML formatter when format is yml', () => {
    const data: FlatResult = [{ path: 'file1.md', title: 'Title 1' }]

    const options = {
      format: 'yml' as const,
      pretty: false,
    }

    const result = formatResult(data, options)
    expect(result).toContain('- path:')
    expect(result).toContain('  title:')
  })
})
