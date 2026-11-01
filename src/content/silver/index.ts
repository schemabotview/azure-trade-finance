import type { Course } from '../types'
import { currentRow } from './01-current-row'
import { dedupe } from './02-dedupe'
import { merge } from './03-merge'
import { lateOlder } from './04-late-older'
import { deltaLog } from './05-delta-log'
import { reference } from './06-reference'
import { g3 } from './07-g3'
import { join } from './08-join'

// Course 9 · One true row per LC. Every section runs locally (PySpark 4.2 + Delta 4.4).
export const silver: Course = {
  id: 'silver',
  title: 'One true row per LC',
  sections: [currentRow, dedupe, merge, lateOlder, deltaLog, reference, g3, join],
}
