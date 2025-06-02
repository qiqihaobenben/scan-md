#!/usr/bin/env node

import path from 'path'
import { Command } from '@commander-js/extra-typings'
import { z } from 'zod'
import { processMarkdownFiles } from './utils/file-scanner.js'
import { outputResult } from './utils/output-formatter.js'
import type { ICommandOptions } from './types/index.js'

// Validate command options using zod
const commandOptionsSchema = z.object({
  dir: z.string().default(process.cwd()),
  output: z.string().optional(),
  format: z.enum(['json', 'yml']).default('json'),
  parentTag: z.union([z.literal('flat'), z.literal('tree'), z.boolean()]).default(false),
  ignore: z.array(z.string()).default([]),
  pretty: z.boolean().default(false),
})

// Create the program
const program = new Command()
  .name('scan-md')
  .description('Scan markdown files and generate structured output')
  .version('0.1.0')
  .option('-d, --dir <directory>', 'Directory to scan for markdown files', process.cwd())
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --format <format>', 'Output format (json or yml)', 'json')
  .option('-p, --parent-tag [mode]', 'Organization mode (flat or tree)', false)
  .option('--ignore <patterns...>', 'Glob patterns to ignore')
  .option('--pretty', 'Prettify JSON output', false)

async function main(): Promise<void> {
  program.parse()

  try {
    // Parse and validate options
    const options = program.opts()

    // 处理 parentTag 参数，将 true 转为 'flat'
    let parentTagValue = options.parentTag
    if (parentTagValue === true) {
      parentTagValue = 'flat'
    }

    const validatedOptions = commandOptionsSchema.parse({
      ...options,
      dir: path.resolve(options.dir),
      parentTag: parentTagValue,
    })

    // 确定扫描深度
    const scanDepth = validatedOptions.parentTag === 'tree' ? 9999999 : 1

    // Process markdown files
    const result = await processMarkdownFiles(
      {
        dir: validatedOptions.dir,
        ignore: validatedOptions.ignore,
        depth: scanDepth,
      },
      !!validatedOptions.parentTag
    )

    // Output the result
    await outputResult(result, {
      format: validatedOptions.format,
      pretty: validatedOptions.pretty,
      output: validatedOptions.output,
    })
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
