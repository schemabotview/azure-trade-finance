import type { Course } from '../types'
import { adfParts } from './01-adf-parts'
import { runtimes } from './02-runtimes'
import { linkedService } from './03-linked-service'
import { copy } from './04-copy'
import { watermark } from './05-watermark'
import { parameters } from './06-parameters'
import { triggers } from './07-triggers'
import { monitor } from './08-monitor'

// Course 7 · Data Factory. Every section recorded on Azure: TradeBook stands in as a PostgreSQL VM in the
// simulated bank network, reached by the bank's self-hosted runtime; landing is the private lake.
export const extract: Course = {
  id: 'extract',
  title: 'Data Factory',
  sections: [adfParts, runtimes, linkedService, copy, watermark, parameters, triggers, monitor],
}
