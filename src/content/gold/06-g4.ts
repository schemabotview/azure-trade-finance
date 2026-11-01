import type { Section } from '../types'

export const g4: Section = {
  id: 'g4',
  title: 'G4: Gold must add up',
  scene: 'gold-g4',
  narration:
    "Gold has two tables, and they describe the same money two ways: the fact table, one row per letter of credit, and the aggregate, one row per group and currency. Per currency, the two totals must be equal, to the cent. That is the fourth gate, G four, the function in the editor: it sums the fact's mapped exposure per currency, sums the aggregate per currency, and compares them. To see it work, this step plants a bug, of a kind that is easy to write. Someone filters the aggregate to letters of credit that are still open, and writes open as issued or active, forgetting amended. The side pane shows the line. The terminal shows the result, and nothing about it looks broken: every group gets a number, and no group is in breach. Woodgrove reads seventy five percent. That is the danger. Then G four runs. In euros, the fact says six point five two million and the aggregate one point five two one million. In dollars, twenty point nine two five million against ten point zero zero nine million. Fail, and Gold is not published. Every amended letter of credit, seventy nine of them, fell out of the aggregate, and no other check would have noticed, because a smaller exposure raises no alarm. Next, the bug removed, and the answer the desk has been waiting for.",
}
