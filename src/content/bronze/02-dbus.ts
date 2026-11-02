import type { Section } from '../types'

export const dbus: Section = {
  id: 'dbus',
  title: 'Compute and DBUs: what a night costs',
  scene: 'bronze-dbus',
  narration:
    "Databricks charges in its own unit, the D B U: compute time, weighted by the kind of compute. How many you pay for, and what else you pay for beside them, depends on where the compute runs. This section models one month of nightly runs, and the label is honest about what that means: the usage is assumed, and every price is Azure's own, read from the public retail prices A P I when the step was recorded. The editor shows the assumptions, each named: thirty nights, half an hour a night, a driver and one worker, one D B U per node hour for this node type, and two D B Us an hour for the same work on serverless. The side pane draws the two ways to run it. A job cluster starts virtual machines in our own subscription, inside the network from Course six, and is billed twice: D B Us on Databricks' meter, and the machines on Azure's. Serverless runs on Databricks' machines, so it is billed in D B Us only, at a higher rate, and starts in seconds rather than minutes. The terminal and the table show the month. The job cluster costs nine dollars in D B Us and about seven dollars eighty six in machines, nearly seventeen dollars in all. Serverless costs fifteen. At this size the two are close; what usually decides is not price but where the machines run, and the bank wants its data processed inside its own network. Next, Unity Catalog, which decides who may read what.",
}
