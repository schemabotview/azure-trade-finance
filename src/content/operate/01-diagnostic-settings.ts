import type { Section } from '../types'

export const diagnosticSettings: Section = {
  id: 'diagnostic-settings',
  title: 'Diagnostic settings: the factory’s records, kept',
  scene: 'operate-diagnostic-settings',
  narration:
    "Data Factory keeps a record of every run it makes: each pipeline run, each activity in it, each trigger firing. On its own, it keeps them for a few weeks, in its own screens. To ask questions of them, and to alert on them, they need to go somewhere that can be queried, alongside every other service's logs. That place is a Log Analytics workspace, and this section adds one, in Terraform, validated, as the label says. The editor shows the two resources. The workspace, log tradefin dev, keeps thirty days. And a diagnostic setting on the factory, highlighted, says what to send and where: three categories, pipeline runs, activity runs and trigger runs, to the workspace, one table each. The side pane draws the flow, from the factory, through the diagnostic setting, into the workspace, and the table beneath it names the three tables that appear there: A D F pipeline run, A D F activity run, and A D F trigger run. Each row in the activity table is one activity in one run: its pipeline, its name, its status, and when it failed, its error. A diagnostic setting is a small resource with a large effect. Nothing about the pipelines changes, but from now on every night's work is recorded somewhere a query can reach, and that is what the next two sections use. Next, the query itself, in K Q L.",
}
