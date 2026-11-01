import type { Course } from '../types'
import { immutableBatchFolders } from './03-immutable-batch-folders'
import { incrementalByWatermark } from './04-incremental-by-watermark'
import { theManifest } from './05-the-manifest'
import { g1Fails } from './06-g1-fails'
import { retrySafeLanding } from './07-retry-safe-landing'
import { referenceFiles } from './08-reference-files'

// Course 5 · ADLS Gen2, and a batch you can trust (the pilot). Sections 3–8 are authored: they run
// locally against TradeBook and Azurite. Sections 1, 2 and 9 are recorded on Azure and wait for the
// recording secrets (CLAUDE.md, "Status").
export const land: Course = {
  id: 'land',
  title: 'ADLS Gen2, and a batch you can trust',
  sections: [immutableBatchFolders, incrementalByWatermark, theManifest, g1Fails, retrySafeLanding, referenceFiles],
}
