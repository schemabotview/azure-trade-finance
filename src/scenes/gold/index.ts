import type { SceneModel } from '@graphlearning/graphl-flow'
import { goldRule } from './rule'
import { goldFact } from './fact'
import { goldCurrency } from './currency'
import { goldDecimal } from './decimal'
import { goldUtilisation } from './utilisation'
import { goldG4 } from './g4'
import { goldAnswer } from './answer'

export const goldScenes: Record<string, SceneModel> = {
  'gold-exposure-rule': goldRule,
  'gold-fact': goldFact,
  'gold-per-currency': goldCurrency,
  'gold-decimal': goldDecimal,
  'gold-utilisation': goldUtilisation,
  'gold-g4': goldG4,
  'gold-the-answer': goldAnswer,
}
