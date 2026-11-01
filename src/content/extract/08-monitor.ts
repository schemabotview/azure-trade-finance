import type { Section } from '../types'

export const monitor: Section = {
  id: 'monitor',
  title: 'Monitoring a run, and rerunning from the failure',
  scene: 'extract-monitor',
  narration:
    "Every run leaves a record: the run itself, and one activity run for each step, with its status, its input and its output. This section reads those records on a night that goes wrong, and the label is honest about how: the fault is staged. Overnight, the server the bank's runtime lives on was patched, and the runtime's service did not come back. The terminal starts the next night's extract, batch forty three, and waits. The run fails, and its activity runs say exactly where and why: the very first activity, the watermark lookup, timed out after five minutes, because no runtime was there to do the work. Nothing after it ran, so nothing was copied and the watermark did not move. The fix is to start the service on the runtime's server, and the helper then waits until Data Factory reports the runtime online again. Now the choice. Rerunning from the failed activity starts the run again at the step that failed, and keeps whatever succeeded before it. Here nothing had succeeded, and the rerun goes all the way through: the watermark from the first of November, three rows in the window, three copied, G one equal, sealed, committed. Those three rows are the desk's late amendments from Course five, landing in the night they belong to. The table in the side pane draws the line that matters. A transient fault, like a runtime that was down, is what a rerun from the failure is for. A gate's fail is the data telling you something, and a rerun repeats the same answer. Next course, Databricks turns these batches into Bronze.",
}
