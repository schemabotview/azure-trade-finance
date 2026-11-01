import type { Section } from '../types'

export const deltaLog: Section = {
  id: 'delta-log',
  title: 'Delta keeps a log: every commit, and the table as it was',
  scene: 'silver-delta-log',
  narration:
    "A Delta table is not one file. It is a folder of Parquet data files and, beside them, a folder called underscore delta log, and that log is what makes it a table. The terminal on the right lists it for Silver: one numbered JSON file per commit, from zero to four, each with a checksum beside it. The left of the frame draws them as a chain. Version zero wrote the empty table. Version one is the merge of batch forty one, four hundred rows inserted. Version two, batch forty two: eighteen inserted, one hundred and two updated. Version three, the correction file: three updated. Version four, the replay: nothing inserted, nothing updated. The file history dot p y reads that same log through Delta's own history call, and the numbers are the ones the merge printed, because they come from the commits themselves. Then it does something a plain folder of files cannot: it reads the table as of version one, before batch forty two ever arrived. The answer is drawn below the chain: L C twenty forty one at version one, two million. Nothing was copied to keep that answer; the old data files were simply never deleted, and the log knows which ones made up version one. This is how a question about last night's numbers can be answered after tonight's run. Next, the other tables Silver needs: the risk team's reference data.",
}
