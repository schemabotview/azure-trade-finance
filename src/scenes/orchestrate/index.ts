import type { SceneModel } from '@graphlearning/graphl-flow'
import { orchestrateGatePolicy } from './gate-policy'
import { orchestrateAudit } from './audit'
import { orchestrateThreeKinds } from './three-kinds'
import { orchestrateFailedNight } from './failed-night'

export const orchestrateScenes: Record<string, SceneModel> = {
  'orchestrate-gate-policy': orchestrateGatePolicy,
  'orchestrate-audit-table': orchestrateAudit,
  'orchestrate-failed-night': orchestrateFailedNight,
  'orchestrate-three-kinds-of-progress': orchestrateThreeKinds,
}
