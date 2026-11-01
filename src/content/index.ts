import { intro } from './intro'
import { howAzureRuns } from './how-azure-runs'
import { start } from './start'
import { secure } from './secure'
import { land } from './land'
import { network } from './network'
import { bronzeCourse } from './bronze'
import { silver } from './silver'
import { gold } from './gold'
import { orchestrate } from './orchestrate'
import type { Course, Section } from './types'

// Course registry, in syllabus order. One course per chapter of COURSE-PLAN.md; a course is
// registered here only once it is authored.
export const COURSES: Record<string, Course> = {
  [intro.id]: intro,
  [howAzureRuns.id]: howAzureRuns,
  [start.id]: start,
  [secure.id]: secure,
  [land.id]: land,
  [network.id]: network,
  [bronzeCourse.id]: bronzeCourse,
  [silver.id]: silver,
  [gold.id]: gold,
  [orchestrate.id]: orchestrate,
}

export type { Course, Section }

// slugOf / allSections are the shell's — the slug rule (`<courseId>-<sectionId>`) is part of the
// route contract every recorder drives, so it cannot be a per-repo decision. Re-exported here
// because this module is what the app and the scripts import them from.
export { slugOf, allSections } from '@graphlearning/shell'

export function getCourse(id: string): Course | undefined {
  return COURSES[id]
}
