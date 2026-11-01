import type { Section } from '../types'

export const bronze: Section = {
  id: 'bronze',
  title: 'Bronze: every version, appended as received',
  scene: 'bronze-bronze',
  narration:
    "Bronze is the first table the pipeline builds, and its rule is simple: keep everything that arrived, exactly as it arrived. On Ana's laptop it runs locally, in PySpark with Delta Lake, and it reads the landing zone, which here is the emulator, as the label says. One thing first. Batch forty one was landed in Course five before batches were sealed, and Bronze reads only sealed batches, the ones that passed the landing gate. It was checked by hand back then, so the first command seals it. Bronze dot p y lists the sealed batches, skips any it has already taken, and for each new one reads the C S V with every column kept as a string: nothing is parsed or converted, so nothing can be lost or misread on the way in. Three columns are added, highlighted in the editor: the batch I D, the file it came from, and the time Bronze took it. Then the rows are appended to a Delta table. The terminal shows the first run: four hundred rows from batch forty one, one hundred and twenty from batch forty two. The second run appends nothing, because both batches are already in. And the last query shows what Bronze is for: this letter of credit appears twice, version one from batch forty one and version two from batch forty two. Bronze keeps the history. Next, rows that should never get in.",
}
