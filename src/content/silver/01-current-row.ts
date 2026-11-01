import type { Section } from '../types'

export const currentRow: Section = {
  id: 'current-row',
  title: 'The current row: one per LC, out of every version',
  scene: 'silver-current-row',
  narration:
    "Bronze answers the question, what arrived. The risk team asks a different one: what does TradeBook say about each letter of credit right now. That is Silver's job, and this course builds it, locally, in PySpark and Delta. The new file, current dot p y, only looks. It counts Bronze's rows, counts the distinct L C I Ds, and then counts how many rows each L C has. The terminal answers: nine hundred and twenty three rows, for four hundred and eighteen letters of credit. The table in the side pane breaks that down. Eighteen L Cs appear once. Most appear twice, some three times, and three of them four times. Every extra row is either an older version, an amendment that has since been replaced, or the same version delivered again, like batch forty four, the replayed file from the last course. None of those rows is wrong. Bronze is right to keep them all. But summing Bronze would count the same money two, three or four times. So the rule for Silver is drawn in the side pane: for every L C I D, keep the row with the highest source version, the number TradeBook itself increments on every change. Nine hundred and twenty three rows go in; four hundred and eighteen come out, one current row per letter of credit. Next, the window function that does exactly that.",
}
