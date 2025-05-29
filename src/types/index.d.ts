/**
 * Command line options for the scan-md tool
 */
export interface ICommandOptions {
  /** Directory to scan for markdown files */
  dir: string
  /** Output file path. If not provided, output to console */
  output?: string
  /** Output format (json or yml) */
  format: 'json' | 'yml'
  /** Whether to organize by parent directory */
  parentTag: boolean
  /** Ignore patterns (glob patterns) */
  ignore: string[]
  /** Prettify JSON output */
  pretty: boolean
  /** Directory nesting depth for parentTag mode */
  depth: number
}

/**
 * Represents a markdown file entry
 */
export interface IMarkdownEntry {
  /** Relative path to the markdown file */
  path: string
  /** Title extracted from the markdown file */
  title: string
}

/**
 * Result without parent tag organization (flat array)
 */
export type FlatResult = IMarkdownEntry[]

/**
 * Result with parent tag organization (grouped by directory)
 */
export type GroupedResult = Record<string, IMarkdownEntry[] | Record<string, any>>

/**
 * Combined result type
 */
export type ScanResult = FlatResult | GroupedResult
