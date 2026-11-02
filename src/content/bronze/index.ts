import type { Course } from '../types'
import { twoPlanes } from './01-two-planes'
import { dbus } from './02-dbus'
import { unityCatalog } from './03-unity-catalog'
import { reachingTheLake } from './04-reaching-the-lake'
import { autoload } from './05-autoload'
import { bronze } from './06-bronze'
import { g2 } from './07-g2'
import { aReplayedFile } from './08-a-replayed-file'

// Course 8 · Azure Databricks: raw and complete. §6–8 run locally (PySpark + Delta). §1–5 (Databricks'
// two planes, workspaces and DBUs, Unity Catalog, the access connector, Auto Loader) are recorded on
// Azure once the Databricks credentials are in the environment.
export const bronzeCourse: Course = {
  id: 'bronze',
  title: 'Azure Databricks: raw and complete',
  sections: [twoPlanes, dbus, unityCatalog, reachingTheLake, autoload, bronze, g2, aReplayedFile],
}
