import type { Section } from '../types'

export const fact: Section = {
  id: 'fact',
  title: 'fact_lc_exposure: one row per LC',
  scene: 'gold-fact',
  narration:
    "Every report the desk reads will be a sum, and a sum is only as trustworthy as the rows beneath it. So Gold's first table is the fact table, fact L C exposure, at the finest grain there is: one row per letter of credit. The side pane draws how it is built. It starts from Silver's current rows, applies the exposure rule, and then joins the counterparty mapping, to give each letter of credit its group. That join, highlighted in the editor, is a left join, for the reason the last course found: an inner join would silently drop the letter of credit with no group, and its money with it. With a left join it keeps its row, with an empty group, where G three, and anyone reading the table, can see it. The terminal shows four hundred and eighteen rows, one per letter of credit, the same count as Silver. Then fact dot p y lists one group's open letters of credit: Woodgrove has three, all in dollars, from three of its companies. Two point two million amended, the one followed since Course five, five million active, and two point five million issued. Together, nine point seven million dollars. That is the number the morning report will carry for Woodgrove, and from here on every figure in Gold can be traced back to rows like these. Next, adding them up, without adding up what must never be added.",
}
