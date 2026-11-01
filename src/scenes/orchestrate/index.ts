import type { SceneModel } from '@graphlearning/graphl-flow'
import { orchestrateGatePolicy } from './gate-policy'
import { orchestrateAudit } from './audit'

export const orchestrateScenes: Record<string, SceneModel> = {
  'orchestrate-gate-policy': orchestrateGatePolicy,
  'orchestrate-audit-table': orchestrateAudit,
}
