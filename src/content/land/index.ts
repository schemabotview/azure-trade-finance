import type { Course } from '../types'
import { storageAndHns } from './01-storage-and-hns'
import { containersAsZones } from './02-containers-as-zones'
import { immutableBatchFolders } from './03-immutable-batch-folders'
import { incrementalByWatermark } from './04-incremental-by-watermark'
import { theManifest } from './05-the-manifest'
import { g1Fails } from './06-g1-fails'
import { retrySafeLanding } from './07-retry-safe-landing'
import { referenceFiles } from './08-reference-files'
import { whoMayRead } from './09-who-may-read'

// Course 5 · ADLS Gen2, and a batch you can trust (the pilot). §1, §2 and §9 are recorded on Azure
// (Terraform); §3–§8 run locally against TradeBook and Azurite.
export const land: Course = {
  id: 'land',
  title: 'ADLS Gen2, and a batch you can trust',
  sections: [storageAndHns, containersAsZones, immutableBatchFolders, incrementalByWatermark, theManifest, g1Fails, retrySafeLanding, referenceFiles, whoMayRead],
}
