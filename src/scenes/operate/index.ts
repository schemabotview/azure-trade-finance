import type { SceneModel } from '@graphlearning/graphl-flow'
import { operateTwoEnvs } from './two-envs'
import { operateWhereNext } from './where-next'

export const operateScenes: Record<string, SceneModel> = {
  'operate-two-environments': operateTwoEnvs,
  'operate-where-next': operateWhereNext,
}
