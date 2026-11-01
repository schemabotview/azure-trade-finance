import { outputOf } from './lab'

// Spark's show() tables, read back from a transcript: a scene quotes Spark's own rows, never retyped.
// `+---+` rules are skipped; the first row is the header; cells are trimmed.
export function showTable(text: string): { head: string[]; rows: string[][] } {
  const lines = text.split('\n').filter((l) => l.startsWith('|'))
  const cells = lines.map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
  return { head: cells[0] ?? [], rows: cells.slice(1) }
}

/** The nth show() table a command printed: a table is a run of lines that start with + or |. */
export function shown(session: string, command: string, nth = 0) {
  const tables: string[][] = []
  let run: string[] = []
  for (const line of outputOf(session, command).split('\n')) {
    if (line.startsWith('+') || line.startsWith('|')) run.push(line)
    else if (run.length) { tables.push(run); run = [] }
  }
  if (run.length) tables.push(run)
  return showTable((tables[nth] ?? []).join('\n'))
}

/** Every line of a command's output except Spark's launcher notice. */
export const printed = (session: string, command: string) =>
  outputOf(session, command).split('\n').filter((l) => !l.startsWith('WARNING: Using incubator'))

/** 9700000.00 → "9,700,000.00" */
export const money = (s: string) => Number(s).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Keep only the lines a terminal pane should show: drop Spark's launcher notice everywhere. */
export const SPARK_NOTICE = 'WARNING: Using incubator modules: jdk.incubator.vector'
