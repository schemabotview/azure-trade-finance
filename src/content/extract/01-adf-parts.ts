import type { Section } from '../types'

export const adfParts: Section = {
  id: 'adf-parts',
  title: 'Data Factory’s parts',
  scene: 'extract-adf-parts',
  narration:
    "In Course five, Ana's extract dot p y did the night's work on her laptop: read the window from TradeBook, write a batch to landing, check it with G one, move the watermark. In the bank, that job belongs to Azure Data Factory, the A D F the map has shown since Course six. This course builds the same extract in it, step by step, recorded once on Azure. The side pane draws how a factory is put together. A pipeline is a unit of work that can be run, scheduled and monitored. It is made of activities, each one step: a lookup, a copy, a condition. Activities read and write datasets, which name data inside a store. A dataset belongs to a linked service, which says how to reach a store and as whom. And a linked service names an integration runtime, the compute that actually does the reaching. The editor shows this step's Terraform. The factory wears the pipeline's identity, so a credential refers to it, and nothing secret is written down. The linked service to the lake goes through the bank's runtime, highlighted, because only from inside the bank, over the private network, can the lake be reached. The pipeline's identity is allowed to write to landing, and only landing. The terminal shows the apply, six resources, and then the factory's own list: two linked services, Key Vault and the lake, and two datasets for files in landing. Next, the runtimes that do the work.",
}
