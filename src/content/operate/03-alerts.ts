import type { Section } from '../types'

export const alerts: Section = {
  id: 'alerts',
  title: 'Alerts: from a query to someone’s phone',
  scene: 'operate-alerts',
  narration:
    "A query answers when someone asks. An alert asks on its own. This section turns the last section's query into one, in Terraform, validated, as the label says, and the side pane draws its three parts. The signal is the query: failed rows in the activity table, read from the same file. The rule decides how often to ask and what counts: every fifteen minutes, it looks back over the last hour, and if there is even one failed activity, it fires. Those three settings are highlighted in the editor. And the action is the action group from Course three, a g trade risk, the same one the budget already uses, which emails the risk team's shared address. Keeping the action group separate from the rule means the people to tell are written down once, and every alarm in the subscription points at them. The table at the bottom shows why this alarm is needed even though the Databricks job already sends an email when a night fails. The job's email covers a night that reached the job and failed a gate. This alert covers everything that never reached the job at all: the extract that timed out because the runtime was down, as in Course seven, or a copy that could not reach TradeBook. Between the two, a failed night is never silent. Next, where the money goes.",
}
