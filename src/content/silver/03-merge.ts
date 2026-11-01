import type { Section } from '../types'

export const merge: Section = {
  id: 'merge',
  title: 'MERGE: insert the new, update only the newer',
  scene: 'silver-merge',
  narration:
    "Rebuilding Silver from all of Bronze every night gets slower every night. Delta Lake can do better: it can merge a batch into an existing table. Silver dot p y now takes one batch at a time, deduplicated within itself, and merges it into Silver, matching rows on the L C I D. The side pane draws the paths an incoming row can take. If no row in Silver has its L C I D, it is a letter of credit Silver has not seen, and it is inserted. If one does, the row is updated, but only on one condition, highlighted in the editor: the incoming source version must be greater than the one Silver already holds. To show it from the start, the first command removes Silver, and the merge runs batch by batch through batch forty three. The counts in the side pane are Delta's own, read from each commit. Batch forty one: four hundred rows, all inserted. Batch forty two: one hundred and twenty rows; eighteen are new letters of credit, and one hundred and two update ones Silver already had. Batch forty three, the correction file, updates the three late amendments, because each carries a newer version. And L C twenty forty one comes out the same as before: version two, from batch forty two. Two paths are drawn. There is a third: matched, but not newer. Next, what happens on that path, and why it matters.",
}
