import type { Section } from '../types'

export const threeKindsOfProgress: Section = {
  id: 'three-kinds-of-progress',
  title: 'Three kinds of progress',
  scene: 'orchestrate-three-kinds-of-progress',
  narration:
    "A nightly pipeline will fail one night, somewhere in the middle, and the most useful property it can have is that the answer to a failure is simply: run it again. This pipeline has that property, and the frame shows why. Each stage remembers how far it got, and each remembers it differently. On the left is the extraction, which remembers a watermark: the end of the last window it landed and sealed. The terminal reads it: the first of November, two in the morning. The watermark only moves after G one has sealed a batch, so after a failure the next run asks TradeBook for the same rows again, and nothing is lost or skipped. In the middle is Bronze, which remembers which batches it has taken, like a checkpoint. Run again, it reports every batch already in Bronze and appends nothing. On the right is Silver, and Silver's memory is different again. It keeps a list of merged batches too, and the first run finds nothing new. But then the list is deleted, as if Silver had lost track completely, and every batch is merged again from the start. Four hundred, one hundred and twenty, three, and four hundred rows: nothing inserted, nothing updated, every row ignored. Silver's real progress is the business state itself. A row only changes when a newer source version arrives, so replaying old batches changes nothing. Three different memories, one result: after a failure at any point, the same rerun is safe. Next course, watching the pipeline, paying for it, and shipping it.",
}
