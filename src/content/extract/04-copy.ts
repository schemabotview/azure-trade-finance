import type { Section } from '../types'

export const copy: Section = {
  id: 'copy',
  title: 'The Copy activity',
  scene: 'extract-copy',
  narration:
    "The Copy activity is Data Factory's workhorse: read from a source, write to a sink. This step's pipeline, p l full load, copies TradeBook's letters of credit, all of them, into landing, which is what Course five's first batch was. The editor shows the pipeline's file, in the shape Data Factory itself stores. The source is a query against TradeBook, highlighted. The sink is a dataset, a C S V file in landing, and its folder is an expression: lc deals, batch I D equals, and then the batch I D the run is given. Terraform deploys this file as written, so adding a pipeline to the factory is adding a file to the project. The terminal shows the apply, then the run: batch forty one, with a window ending at two in the morning on the thirty first of October. The helper script starts it, waits, and lists its activities. The copy succeeded with four hundred rows, the same four hundred letters of credit as batch forty one on Ana's laptop. A second activity wrote one row more: the watermark, the end of this window, which is where tomorrow's extract will start. The side pane follows the data: from TradeBook, read by the bank's own runtime, across the peering to the lake's private endpoint, into landing, written as the pipeline's identity. No key, no password and no public endpoint were involved anywhere. Next, the pipeline that runs every night.",
}
