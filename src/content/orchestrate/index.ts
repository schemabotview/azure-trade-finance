import type { Course } from '../types'
import { gatePolicy } from './02-gate-policy'
import { auditTable } from './03-audit-table'

// Course 11 · Every night, and the night it fails. §2–3 run locally. §1, §4–7 (the Databricks job, its
// failure email, the ADF parent pipeline, one schedule owner, a failed night on Azure) and the ◆ §8 lab are
// recorded once Databricks credentials are in the environment.
export const orchestrate: Course = {
  id: 'orchestrate',
  title: 'Every night, and the night it fails',
  sections: [gatePolicy, auditTable],
}
