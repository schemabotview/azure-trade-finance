import type { SceneModel } from '@graphlearning/graphl-flow'
import { landHns } from './hns'
import { landZones } from './zones'
import { landBatchFolders } from './batch-folders'
import { landWatermark } from './watermark'
import { landManifest } from './manifest'
import { landG1Fails } from './g1-fails'
import { landRetrySafe } from './retry-safe'
import { landReference } from './reference'
import { landWhoMayRead } from './who-may-read'

export const landScenes: Record<string, SceneModel> = {
  'land-hns': landHns,
  'land-zones': landZones,
  'land-batch-folders': landBatchFolders,
  'land-watermark': landWatermark,
  'land-manifest': landManifest,
  'land-g1-fails': landG1Fails,
  'land-retry-safe': landRetrySafe,
  'land-reference': landReference,
  'land-who-may-read': landWhoMayRead,
}
