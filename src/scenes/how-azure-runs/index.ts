import type { SceneModel } from '@graphlearning/graphl-flow'
import { howRegions } from './regions'
import { howHierarchy } from './hierarchy'
import { howArm } from './arm'
import { howPlanes } from './planes'
import { howClients } from './clients'
import { howModels } from './models'
import { howCharges } from './charges'

export const howScenes: Record<string, SceneModel> = {
  'how-azure-runs-regions': howRegions,
  'how-azure-runs-hierarchy': howHierarchy,
  'how-azure-runs-arm': howArm,
  'how-azure-runs-planes': howPlanes,
  'how-azure-runs-three-clients': howClients,
  'how-azure-runs-service-models': howModels,
  'how-azure-runs-charges': howCharges,
}
