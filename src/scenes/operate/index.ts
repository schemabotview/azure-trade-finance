import type { SceneModel } from '@graphlearning/graphl-flow'
import { operateDiagnostics } from './diagnostics'
import { operateKql } from './kql'
import { operateAlerts } from './alerts'
import { operateUsage } from './usage'
import { operateTwoEnvs } from './two-envs'
import { operateCi } from './ci'
import { operateWhereNext } from './where-next'

export const operateScenes: Record<string, SceneModel> = {
  'operate-diagnostic-settings': operateDiagnostics,
  'operate-kql': operateKql,
  'operate-alerts': operateAlerts,
  'operate-where-the-money-goes': operateUsage,
  'operate-ci-no-secret': operateCi,
  'operate-two-environments': operateTwoEnvs,
  'operate-where-next': operateWhereNext,
}
