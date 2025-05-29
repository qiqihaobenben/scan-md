import fs from 'fs/promises'
import yaml from 'js-yaml'
import { z } from 'zod'
import type { ScanResult } from '../types/index.js'

/**
 * Schema for output formatter options
 */
const outputOptionsSchema = z.object({
  format: z.enum(['json', 'yml']).default('json'),
  pretty: z.boolean().default(false),
  output: z.string().optional(),
})

/**
 * Output formatter options
 */
export interface IOutputOptions {
  format: 'json' | 'yml'
  pretty: boolean
  output?: string
}

/**
 * Format scan result as JSON
 * @param result Scan result
 * @param pretty Whether to pretty-print JSON
 * @returns Formatted JSON string
 */
export function formatAsJson(result: ScanResult, pretty: boolean): string {
  return JSON.stringify(result, null, pretty ? 2 : undefined)
}

/**
 * Format scan result as YAML
 * @param result Scan result
 * @returns Formatted YAML string
 */
export function formatAsYaml(result: ScanResult): string {
  return yaml.dump(result, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  })
}

/**
 * Format scan result based on specified format
 * @param result Scan result
 * @param options Output options
 * @returns Formatted string
 */
export function formatResult(result: ScanResult, options: IOutputOptions): string {
  const validatedOptions = outputOptionsSchema.parse(options)

  return validatedOptions.format === 'json' ? formatAsJson(result, validatedOptions.pretty) : formatAsYaml(result)
}

/**
 * Output scan result to file or console
 * @param result Scan result
 * @param options Output options
 */
export async function outputResult(result: ScanResult, options: IOutputOptions): Promise<void> {
  const validatedOptions = outputOptionsSchema.parse(options)
  const formattedResult = formatResult(result, validatedOptions)

  if (validatedOptions.output) {
    await fs.writeFile(validatedOptions.output, formattedResult, 'utf-8')
    console.log(`Output written to ${validatedOptions.output}`)
  } else {
    console.log(formattedResult)
  }
}
