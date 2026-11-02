import type { SceneModel } from '@graphlearning/graphl-flow'
import { orchestrateGatePolicy } from './gate-policy'
import { orchestrateAudit } from './audit'
import { orchestrateThreeKinds } from './three-kinds'
import { orchestrateFailedNight } from './failed-night'
import { orchestrateJobs } from './jobs'
import { orchestrateEmail } from './email'
import { orchestrateParent } from './parent'
import { orchestrateSchedule } from './schedule'

export const orchestrateScenes: Record<string, SceneModel> = {
  'orchestrate-databricks-jobs': orchestrateJobs,
  'orchestrate-failure-email': orchestrateEmail,
  'orchestrate-adf-parent': orchestrateParent,
  'orchestrate-one-schedule': orchestrateSchedule,
  'orchestrate-gate-policy': orchestrateGatePolicy,
  'orchestrate-audit-table': orchestrateAudit,
  'orchestrate-failed-night': orchestrateFailedNight,
  'orchestrate-three-kinds-of-progress': orchestrateThreeKinds,
}
