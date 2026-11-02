import type { Section } from '../types'

export const failureEmail: Section = {
  id: 'failure-email',
  title: 'Failure email',
  scene: 'orchestrate-failure-email',
  narration:
    "A nightly job that fails quietly is worse than one that does not run at all: the desk would read yesterday's answer and not know it. So a failed night must tell someone. The editor shows the smallest version of that, in the job's Terraform, validated, as the label says: email notifications, on failure, to the risk engineers' shared address. The side pane follows a failed night through it. The G three task exits with an error. The jobs service marks the run failed, and sends the email, with the run, the task that failed, and a link to its output. The email says that something failed. It does not say why, and that is deliberate: the why is in the audit table from section three, where every check of every gate is a row with its detail. The engineer who reads the email at eight in the morning goes to the table and finds, in one query, that counterparty C P fifteen oh one has no group. Two channels, two jobs: one wakes someone up, the other tells them what to do. The terminal shows the configuration validated. Course twelve adds a third channel, an alert on the factory's own logs, so that a failure that never reaches the job, such as the runtime being down, is noticed too. Next, the parent pipeline that ties the extract and the job together.",
}
