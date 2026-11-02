import type { SceneModel } from '@graphlearning/graphl-flow'
import { bronzeAutoload } from './autoload'
import { bronzeBronze } from './bronze'
import { bronzeG2 } from './g2'
import { bronzeReplay } from './replay'

export const bronzeScenes: Record<string, SceneModel> = {
  'bronze-autoload': bronzeAutoload,
  'bronze-bronze': bronzeBronze,
  'bronze-g2': bronzeG2,
  'bronze-replay': bronzeReplay,
}
