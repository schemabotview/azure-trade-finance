import type { Section } from '../types'

export const triggers: Section = {
  id: 'triggers',
  title: 'Triggers: a window every night',
  scene: 'extract-triggers',
  narration:
    "A pipeline runs when something starts it. Data Factory has two kinds of trigger for a nightly job, and the difference matters for an extract. A schedule trigger fires at a time. A tumbling window trigger fires for a window of time: it hands the run that window's start and end, it runs windows one at a time and in order, and a window missed while the factory was down is run later rather than skipped. A failed window can also be rerun on its own. The table in the side pane sets the two side by side. The editor shows the trigger. Twenty four hour windows, starting at two in the morning on the thirty first of October, at most one running at a time, passing p l extract its window's end and a batch number. The batch number is an expression too: the number of days since the day before the first batch, so the window ending on the first of November is batch forty two. And one line is highlighted: activated is false. The trigger is created stopped. Starting it is a decision for the bank, not something a deployment should do on its own. The terminal shows the apply, and then the trigger as Data Factory reports it: a tumbling window trigger, stopped, every twenty four hours from the thirty first. The side pane draws its first windows on a line. Next, watching a run, and a night when one fails.",
}
