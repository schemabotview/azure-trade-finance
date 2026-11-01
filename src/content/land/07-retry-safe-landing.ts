import type { Section } from '../types'

export const retrySafeLanding: Section = {
  id: 'retry-safe-landing',
  title: 'Retry-safe landing: overwrite until sealed',
  scene: 'land-retry-safe',
  narration:
    "A failed night has to be run again, and write once gets in the way: the short file is already in the folder, and a retry would be refused. So the rule changes. A batch folder stays open until it is sealed, and while it is open, a retry overwrites the same path. The copy step first checks for a file called underscore success, and refuses if it exists; otherwise it writes the part file, overwriting. The new commit step runs G one, and only if it passes writes underscore success, and only then moves the watermark. In the terminal, the copy runs twice, as a retry would, and both times writes one hundred and twenty rows to the same file: running it again changes nothing. Commit runs the gate, all three checks pass, the batch is sealed, and the watermark moves to two o'clock on the first of November. One more copy is refused: the batch is sealed. The side pane shows the folder's life, open, committed, sealed, and what it holds now: the manifest from lookup, one part file written twice, and the seal. The order matters. If the machine fails between sealing and moving the watermark, the next run finds a sealed batch, and runs only the commit again. Next, the files that do not come from TradeBook at all.",
}
