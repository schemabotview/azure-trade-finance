import type { Section } from '../types'

export const exposureRule: Section = {
  id: 'exposure-rule',
  title: 'The exposure rule: open counts, closed is zero',
  scene: 'gold-exposure-rule',
  narration:
    "Gold is where the desk's question gets its answer: how much could Syndica Bank still have to pay, for each counterparty group, against its limit. G three failed in the last section, and in Course eleven that failure will stop the nightly run. Here, the pipeline is built one piece at a time, so Gold is written against Silver as it stands, and the unmapped letter of credit simply has no group yet. The first piece is the rule, and it is a business rule, not a technical one. A letter of credit that is issued, active or amended is still open: the bank may still have to pay, so its exposure is its full amount. One that is cancelled, closed or expired can no longer be drawn, so its exposure is zero. The function exposure, at the top of the new gold dot p y, says exactly that, in the two highlighted lines. The terminal counts Silver's letters of credit by status and shows which ones count. The side pane groups them. One hundred and sixteen are open: thirteen active, seventy nine amended, twenty four issued. Three hundred and two are closed. Notice what the rule does not do. A closed letter of credit keeps its amount in Silver; only its exposure is zero. Gold derives a new column, and never edits a fact. Next, the table that every number in Gold is summed from.",
}
