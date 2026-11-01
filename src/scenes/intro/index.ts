import type { SceneModel } from '@graphlearning/graphl-flow'
import { introLc } from './lc'
import { introQuestion } from './question'
import { introBuild } from './build'

export const introScenes: Record<string, SceneModel> = {
  'intro-a-letter-of-credit': introLc,
  'intro-the-question': introQuestion,
  'intro-what-we-build': introBuild,
}
