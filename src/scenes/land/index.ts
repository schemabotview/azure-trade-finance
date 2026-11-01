import type { SceneModel } from '@graphlearning/graphl-flow'
import { landBatchFolders } from './batch-folders'
import { landWatermark } from './watermark'
import { landManifest } from './manifest'
import { landG1Fails } from './g1-fails'
import { landRetrySafe } from './retry-safe'
import { landReference } from './reference'

export const landScenes: Record<string, SceneModel> = {
  'land-batch-folders': landBatchFolders,
  'land-watermark': landWatermark,
  'land-manifest': landManifest,
  'land-g1-fails': landG1Fails,
  'land-retry-safe': landRetrySafe,
  'land-reference': landReference,
}
