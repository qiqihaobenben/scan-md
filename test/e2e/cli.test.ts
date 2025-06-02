import { describe, expect, test, beforeAll, afterAll, vi } from 'vitest'
import path from 'path'
import fs from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const testDir = path.join(process.cwd(), 'test', 'e2e', 'test-files')

describe('CLI E2E Tests', () => {
  beforeAll(async () => {
    // Create test directory and sample markdown files
    await fs.mkdir(testDir, { recursive: true })
    await fs.mkdir(path.join(testDir, 'folder1'), { recursive: true })
    await fs.mkdir(path.join(testDir, 'folder2'), { recursive: true })
    await fs.mkdir(path.join(testDir, 'folder2', 'subfolder'), { recursive: true })

    // Create sample files
    await fs.writeFile(path.join(testDir, 'root.md'), '# Root File\n\nThis is content in the root file.')

    await fs.writeFile(path.join(testDir, 'folder1', 'file1.md'), '# File One\n\nThis is content in file one.')

    await fs.writeFile(path.join(testDir, 'folder2', 'file2.md'), '# File Two\n\nThis is content in file two.')

    await fs.writeFile(path.join(testDir, 'folder2', 'subfolder', 'file3.md'), '# File Three\n\nThis is content in file three.')
  })

  afterAll(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true })
  })

  test('should scan directory without parent tag', async () => {
    const { stdout } = await execAsync(`node ./dist/cli.js -d ${testDir}`)
    const result = JSON.parse(stdout)

    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(4)

    const paths = result.map((item: any) => item.path)
    expect(paths).toContain('root.md')
    expect(paths).toContain('folder1/file1.md')
    expect(paths).toContain('folder2/file2.md')
    expect(paths).toContain('folder2/subfolder/file3.md')

    const titles = result.map((item: any) => item.title)
    expect(titles).toContain('Root File')
    expect(titles).toContain('File One')
    expect(titles).toContain('File Two')
    expect(titles).toContain('File Three')
  })

  test('should scan directory with flat organization (implicit)', async () => {
    const { stdout } = await execAsync(`node ./dist/cli.js -d ${testDir} -p`)
    const result = JSON.parse(stdout)

    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(4)

    const paths = result.map((item: any) => item.path)
    expect(paths).toContain('root.md')
    expect(paths).toContain('folder1/file1.md')
    expect(paths).toContain('folder2/file2.md')
    expect(paths).toContain('folder2/subfolder/file3.md')

    const titles = result.map((item: any) => item.title)
    expect(titles).toContain('Root File')
    expect(titles).toContain('File One')
    expect(titles).toContain('File Two')
    expect(titles).toContain('File Three')
  })

  test('should scan directory with flat organization (explicit)', async () => {
    const { stdout } = await execAsync(`node ./dist/cli.js -d ${testDir} -p flat`)
    const result = JSON.parse(stdout)

    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(4)

    const paths = result.map((item: any) => item.path)
    expect(paths).toContain('root.md')
    expect(paths).toContain('folder1/file1.md')
    expect(paths).toContain('folder2/file2.md')
    expect(paths).toContain('folder2/subfolder/file3.md')

    const titles = result.map((item: any) => item.title)
    expect(titles).toContain('Root File')
    expect(titles).toContain('File One')
    expect(titles).toContain('File Two')
    expect(titles).toContain('File Three')
  })

  test('should scan directory with tree organization', async () => {
    const { stdout } = await execAsync(`node ./dist/cli.js -d ${testDir} -p tree`)
    const result = JSON.parse(stdout)

    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(3)

    const folder2 = result.find((item: any) => item.path === 'folder2')
    expect(folder2).toBeDefined()
    expect(folder2.children).toHaveLength(2)
    expect(folder2.children[0].path).toBe('folder2/file2.md')
    expect(folder2.children[1].path).toBe('folder2/subfolder')

    const subfolder = folder2.children.find((item: any) => item.path === 'folder2/subfolder')
    expect(subfolder).toBeDefined()
    expect(subfolder.children).toHaveLength(1)
    expect(subfolder.children[0].path).toBe('folder2/subfolder/file3.md')
  })
})
