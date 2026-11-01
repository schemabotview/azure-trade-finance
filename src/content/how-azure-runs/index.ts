import type { Course } from '../types'
import { regions } from './01-regions'
import { hierarchy } from './02-hierarchy'
import { arm } from './03-arm'
import { planes } from './04-planes'
import { threeClients } from './05-three-clients'
import { serviceModels } from './06-service-models'
import { charges } from './07-charges'

// Course 2 · How Azure is built. §1–5 and §7 are read-only Azure labs, recorded once (no resources);
// §6 is doc-cited.
export const howAzureRuns: Course = {
  id: 'how-azure-runs',
  title: 'How Azure is built',
  sections: [regions, hierarchy, arm, planes, threeClients, serviceModels, charges],
}
