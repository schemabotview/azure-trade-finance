import type { Section } from '../types'

export const databricksJobs: Section = {
  id: 'databricks-jobs',
  title: 'Databricks Jobs: the night as a task graph',
  scene: 'orchestrate-databricks-jobs',
  narration:
    "Course eleven's run dot p y runs the night as one program: Bronze, Silver, G three, Gold, G four, stopping at a failed gate. On Databricks, the same night is a job, and this section declares it in Terraform, validated, as the label says. A job is a set of tasks with dependencies, run on a cluster the job starts for itself and stops when it is done. The editor shows the shape. The task list, highlighted, is the same five steps, in order; G two runs inside the Bronze task. Each task depends on the one before it, which is the other highlighted line: the first task depends on nothing, and every other on its predecessor. The side pane draws the result as the graph Databricks would show. That dependency is the gate policy in the job's own terms. G three's task exits with an error when a check fails, so the task fails, and a task whose dependency failed never starts. Gold is not built, and G four does not run, exactly as on Ana's laptop. The tasks run the project's own files, fetched from its Git repository at the start of each run, so what runs is what was reviewed. The cluster is described rather than kept: one worker, started per run, and gone when the night is over, so nothing is left running to pay for. The terminal shows the configuration validated. Next, the gate policy itself, run for real.",
}
