import type { Course } from '../types'
import { diagnosticSettings } from './01-diagnostic-settings'
import { kql } from './02-kql'
import { alerts } from './03-alerts'
import { whereTheMoneyGoes } from './04-where-the-money-goes'
import { twoEnvironments } from './05-two-environments'
import { ciNoSecret } from './06-ci-no-secret'
import { whereNext } from './07-where-next'

// Course 12 · Watch it, pay for it, ship it. §1–3 and §6 are compiled (validated offline), §4 is recorded
// (the Consumption API, read-only), §5 compiled, §7 a concept frame.
export const operate: Course = {
  id: 'operate',
  title: 'Watch it, pay for it, ship it',
  sections: [diagnosticSettings, kql, alerts, whereTheMoneyGoes, twoEnvironments, ciNoSecret, whereNext],
}
