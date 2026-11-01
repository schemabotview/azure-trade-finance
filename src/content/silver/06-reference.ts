import type { Section } from '../types'

export const reference: Section = {
  id: 'reference',
  title: 'Reference tables: checked first, then published',
  scene: 'silver-reference',
  narration:
    "Silver now knows every letter of credit, and which counterparty applied for each. Exposure is reported by counterparty group, against each group's limit, and both of those come from the risk team, as the two files landed in the reference container in Course five. The new file, reference tables dot p y, reads both files for one business date and, before anything else, checks them. There are five checks, drawn in the side pane: every counterparty I D appears once; every counterparty has a group; there is one limit per group and currency; every limit is a positive amount; and every group that has a limit is also in the mapping. The highlighted lines are the point of the file: if any check fails, nothing is published, and Silver keeps the reference tables it already had. The reason is in the note. A wrong mapping does not break anything visibly. It moves money from one group to another, and the morning report would show a group under its limit that is really over it. Only when all five pass does the script write both tables to Silver, in Delta, with the limit cast to decimal eighteen two. The terminal shows all five passing, and the result: eleven mappings and five limits, as of the thirty first of October. Next, the gate that checks Silver as a whole, before Gold may run.",
}
