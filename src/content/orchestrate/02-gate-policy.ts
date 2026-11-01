import type { Section } from '../types'

export const gatePolicy: Section = {
  id: 'gate-policy',
  title: 'The gate policy: PASS, WARN, FAIL',
  scene: 'orchestrate-gate-policy',
  narration:
    "Every gate so far has been run by hand, and Ana has read its result and decided what to do. A nightly run has nobody to decide, so the decision has to be written down. That is the gate policy, and it has three outcomes, drawn at the top of the side pane. A pass, and the run goes on. A warning, and the run goes on, and says so: two quarantined rows are worth someone's attention in the morning, but they are not a reason to withhold the report. A fail stops every step after it. The new file, run dot p y, is one whole night: Bronze, then G two, then Silver, then G three, then Gold, then G four. The highlighted lines are the policy in code: when G three fails, the run exits, and Gold is never written. The terminal shows tonight's run, and the side pane follows it down. No new batch has arrived, so Bronze takes nothing. G two warns, two rows in quarantine. Silver merges. G three fails, on the same unmapped counterparty, C P fifteen oh one. And Gold does not run; it keeps the last good answer. That last part matters. A failed night does not leave the desk with no report, or with a wrong one. It leaves yesterday's answer in place, clearly yesterday's, until the mapping is fixed. Next, writing every one of these results down, where it can be queried.",
}
