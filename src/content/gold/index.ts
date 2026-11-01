import type { Course } from '../types'
import { exposureRule } from './01-exposure-rule'
import { fact } from './02-fact'
import { perCurrency } from './03-per-currency'
import { decimal } from './04-decimal'
import { utilisation } from './05-utilisation'
import { g4 } from './06-g4'
import { theAnswer } from './07-the-answer'

// Course 10 · The answer. Every section runs locally (PySpark 4.2 + Delta 4.4).
export const gold: Course = {
  id: 'gold',
  title: 'The answer',
  sections: [exposureRule, fact, perCurrency, decimal, utilisation, g4, theAnswer],
}
