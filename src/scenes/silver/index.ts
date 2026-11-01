import type { SceneModel } from '@graphlearning/graphl-flow'
import { silverCurrentRow } from './current-row'
import { silverDedupe } from './dedupe'
import { silverMerge } from './merge'
import { silverLateOlder } from './late-older'
import { silverDeltaLog } from './delta-log'
import { silverReference } from './reference'
import { silverG3 } from './g3'
import { silverJoin } from './join'

export const silverScenes: Record<string, SceneModel> = {
  'silver-current-row': silverCurrentRow,
  'silver-dedupe': silverDedupe,
  'silver-merge': silverMerge,
  'silver-late-older': silverLateOlder,
  'silver-delta-log': silverDeltaLog,
  'silver-reference': silverReference,
  'silver-g3': silverG3,
  'silver-join': silverJoin,
}
