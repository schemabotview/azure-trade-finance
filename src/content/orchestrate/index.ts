import type { Course } from '../types'
import { databricksJobs } from './01-databricks-jobs'
import { gatePolicy } from './02-gate-policy'
import { auditTable } from './03-audit-table'
import { failureEmail } from './04-failure-email'
import { adfParent } from './05-adf-parent'
import { oneSchedule } from './06-one-schedule'
import { failedNight } from './07-failed-night'
import { threeKindsOfProgress } from './08-three-kinds-of-progress'

// Course 11 · Every night, and the night it fails. §2–3 run locally. §1, §4–7 (the Databricks job, its
// failure email, the ADF parent pipeline, one schedule owner, a failed night on Azure) are recorded once
// Databricks credentials are in the environment. ◆ §8 runs locally.
export const orchestrate: Course = {
  id: 'orchestrate',
  title: 'Every night, and the night it fails',
  sections: [databricksJobs, gatePolicy, auditTable, failureEmail, adfParent, oneSchedule, failedNight, threeKindsOfProgress],
}
