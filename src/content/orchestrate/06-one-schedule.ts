import type { Section } from '../types'

export const oneSchedule: Section = {
  id: 'one-schedule',
  title: 'One schedule owner',
  scene: 'orchestrate-one-schedule',
  narration:
    "Both Data Factory and Databricks can run things on a schedule, and that is a trap. The side pane draws it on the left. Data Factory's trigger fires at two in the morning and, after the extract, starts the job. If the job also has its own schedule, say half past two, it starts itself as well, whether the extract has finished, succeeded or even run. On a slow night it reads a batch that has not landed; on a normal night, the night simply runs twice, and two runs merge and publish at once. The fix is to give the night one owner, drawn on the right. Data Factory's trigger is the only clock. The job runs only when the parent pipeline starts it, and so always after the extract, in order, once. The editor shows how that is written down, in the job's Terraform, validated, as the label says. The job still has a schedule, but its pause status is paused, highlighted. Declaring it paused, instead of leaving it out, is deliberate. A schedule left out can be added by anyone in the Databricks interface, and then nothing in the code says it should not be there. A schedule declared paused is visible in review, and the next apply sets it back to paused if someone switches it on. The terminal shows the configuration validated. Next, a night that fails, and how it is fixed.",
}
