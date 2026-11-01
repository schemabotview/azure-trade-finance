import type { SceneModel } from '@graphlearning/graphl-flow'
import { extractParts } from './parts'
import { extractRuntimes } from './runtimes'
import { extractLinked } from './linked'
import { extractCopy } from './copy'
import { extractWatermark } from './watermark'
import { extractParameters } from './parameters'
import { extractTrigger } from './trigger'
import { extractMonitor } from './monitor'

export const extractScenes: Record<string, SceneModel> = {
  'extract-adf-parts': extractParts,
  'extract-runtimes': extractRuntimes,
  'extract-linked-service': extractLinked,
  'extract-copy': extractCopy,
  'extract-watermark': extractWatermark,
  'extract-parameters': extractParameters,
  'extract-triggers': extractTrigger,
  'extract-monitor': extractMonitor,
}
