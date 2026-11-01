import type { Course } from '../types'
import { twoEnvironments } from './05-two-environments'
import { whereNext } from './07-where-next'

// Course 12 · Watch it, pay for it, ship it. §5 is compiled (validated offline) and §7 a concept frame.
// §1–3 (diagnostic settings, KQL, alerts) need the Databricks job's logs; §4 needs Cost Management (refused
// on this subscription); §6 (OIDC from GitHub) needs a federated credential on the app registration.
export const operate: Course = {
  id: 'operate',
  title: 'Watch it, pay for it, ship it',
  sections: [twoEnvironments, whereNext],
}
