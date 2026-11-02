import type { SceneModel } from '@graphlearning/graphl-flow'
import { bronzeAutoload } from './autoload'
import { bronzePlanes } from './planes'
import { bronzeUnity } from './unity'
import { bronzeDbus } from './dbus'
import { bronzeConnector } from './connector'
import { bronzeBronze } from './bronze'
import { bronzeG2 } from './g2'
import { bronzeReplay } from './replay'

export const bronzeScenes: Record<string, SceneModel> = {
  'bronze-two-planes': bronzePlanes,
  'bronze-dbus': bronzeDbus,
  'bronze-unity-catalog': bronzeUnity,
  'bronze-reaching-the-lake': bronzeConnector,
  'bronze-autoload': bronzeAutoload,
  'bronze-bronze': bronzeBronze,
  'bronze-g2': bronzeG2,
  'bronze-replay': bronzeReplay,
}
