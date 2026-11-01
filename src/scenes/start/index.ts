import type { SceneModel } from '@graphlearning/graphl-flow'
import { startTradebook } from './tradebook'
import { startLcLife } from './lc-life'
import { startSigningIn } from './signing-in'
import { startFirstTerraform } from './first-terraform'
import { startState } from './state'
import { startModules } from './modules'
import { startDrift } from './drift'
import { startBudget } from './budget'

export const startScenes: Record<string, SceneModel> = {
  'start-tradebook': startTradebook,
  'start-lc-life': startLcLife,
  'start-signing-in': startSigningIn,
  'start-first-terraform': startFirstTerraform,
  'start-state': startState,
  'start-modules': startModules,
  'start-drift': startDrift,
  'start-budget': startBudget,
}
