import type { Section } from '../types'

export const kql: Section = {
  id: 'kql',
  title: 'KQL: the night’s failed activities',
  scene: 'operate-kql',
  narration:
    "Log Analytics is queried in K Q L, the Kusto query language, and its shape is easy to read once you see it: a table at the top, then a pipeline of steps, each taking the rows from the line above. The editor shows the query this course keeps in its own file, and the side pane takes it apart line by line. It starts from the A D F activity run table: every activity in every run the factory has made. The highlighted line keeps only the failed ones. The next keeps four columns: when, which pipeline, which activity, and the error code. And the last puts the newest first. Read top to bottom, it says exactly what it does: last night's failed activities, newest first. The query is not run here, as the label says: it lives in a file in the project, and the next section's alert reads that same file, so the query an engineer runs by hand in the morning and the one that pages them at night can never drift apart. The terminal shows the lab printing the file after validating the Terraform that uses it. One thing this table does not hold is the gates' own verdicts. Those are rows in the audit table from Course eleven, with every check and its detail. This table holds what the factory saw: a copy that failed, a runtime that did not answer, a lookup that timed out. Next, turning the query into an alarm.",
}
