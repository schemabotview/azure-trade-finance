import type { Section } from '../types'

export const adfParent: Section = {
  id: 'adf-parent',
  title: 'The ADF parent pipeline',
  scene: 'orchestrate-adf-parent',
  narration:
    "The night has two halves. Data Factory extracts, in the bank's network, through the runtime from Course seven. Databricks transforms, in the lake. Something has to run them in order, and only run the second when the first succeeded. That something is a parent pipeline in Data Factory, and the editor shows it: p l nightly, validated with the rest of the lab, as the label says. Its first activity, highlighted, executes Course seven's extract pipeline and waits for it to finish, so the batch is copied, checked by G one, sealed, and the watermark moved, before anything else happens. Its second activity, also highlighted, runs the Databricks job, and it depends on the first succeeding: if G one fails, the job never starts, and Bronze never sees a half delivered batch. The job is reached through a linked service that signs in as the factory's own identity, so once again there is no token or key anywhere. The side pane draws the chain from the trigger down. The tumbling window trigger from Course seven now starts p l nightly instead of the extract alone, passing it the window, the batch number, and the job's identifier, which Terraform fills in from the job it created. Inside the job, G two to G four decide whether Gold is published. The terminal shows the configuration validated. Next, why only one of the two services may own the schedule.",
}
