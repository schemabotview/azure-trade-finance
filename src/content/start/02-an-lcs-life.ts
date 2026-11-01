import type { Section } from '../types'

export const anLcsLife: Section = {
  id: 'an-lcs-life',
  title: 'An LC’s life: what counts as open',
  scene: 'start-lc-life',
  narration:
    "To measure exposure, the pipeline needs one rule: which letters of credit still count. The side pane follows one L C through its life, read from L C amendments by a saved query. Version one: it is issued, in June, for six hundred and forty seven thousand dollars. Version two: it is advised to the exporter and becomes active. Version three: it is amended, and the amount drops to four hundred and seventy six thousand. Version four: it is closed, and from that moment the bank's promise is over. That is the rule in the editor, in open dot s q l. An L C that is issued, active or amended is open, and its amount is exposure: money the bank has promised to pay. An L C that is expired, closed or cancelled carries no exposure at all, though it stays in the data. Notice the last line, group by currency. The terminal shows why. There are forty open L Cs in euros and ninety in dollars, and their totals are printed side by side, never added together, because a sum of dollars and euros is not a number anyone can use. The pipeline will keep that rule all the way to Gold. Next, Azure, and the first sign in.",
}
