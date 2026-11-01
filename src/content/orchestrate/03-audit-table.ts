import type { Section } from '../types'

export const auditTable: Section = {
  id: 'audit-table',
  title: 'The audit table: every check, every night',
  scene: 'orchestrate-audit-table',
  narration:
    "Printing a gate's result to a terminal is fine while someone is watching. At two in the morning nobody is, and a week later someone will ask: when did this counterparty first fail to map, and did any night pass with it missing? So every gate writes its results to a table. Run dot p y now takes a run I D, and the highlighted lines turn each check into a row: the run, the gate, the rule, its status, and the detail. The rows are appended to the audit table, gate results, and never overwritten, so the table is the history of every night. On Azure it will be risk dot audit dot gate results, in the catalog; here it is a local Delta table. The side pane draws the flow, from the gates to one row per check, into the table, and to the question it answers. The terminal shows tonight's run again, under the run I D night forty four, failing at G three exactly as before. Then audit dot p y reads the table back, and the side pane shows its rows. The warning from G two, two rows quarantined. The failed G three check, every open L C's counterparty mapped. And the two G three checks that passed, because a pass is evidence too: it shows the check ran. With this table, what failed and when is a query, not a search through logs, and Course twelve will put an alert on it. The rest of this course runs on Azure: the job, the email, and the parent pipeline that runs it all.",
}
