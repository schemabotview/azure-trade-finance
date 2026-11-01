import type { Section } from '../types'

export const runtimes: Section = {
  id: 'runtimes',
  title: 'Integration runtimes',
  scene: 'extract-runtimes',
  narration:
    "Every activity in a pipeline runs somewhere, on an integration runtime, and choosing the right one is most of what makes a hybrid pipeline work. The terminal asks the factory for its runtimes, and lists just one: i r tradebook s h i r, self hosted, the one built in Course six. Then it asks for that runtime's status: online, on the node v m bank s h i r, with its version number. The side pane draws the two kinds side by side. On the left is Azure's own runtime, the auto resolve integration runtime. It is always there, which is why it is not listed. It runs the pipeline's logic, the conditions and failures, and it can call public endpoints. What it cannot do is reach inside the bank, because nothing from Azure is allowed in. On the right is the self hosted runtime, inside the bank's network beside TradeBook. It calls out to Data Factory and asks for work; it is never called. So every query against TradeBook runs on it. And because the lake's public endpoint was closed in Course six, every copy into landing runs on it too, through the private network. The editor shows the Terraform that declared it: one resource, a name and the factory it belongs to; the installation on the server was Course six's work. A linked service names its runtime, which is how each activity ends up in the right place. Next, a linked service to TradeBook itself.",
}
