import type { Section } from '../types'

export const azurePolicy: Section = {
  id: 'azure-policy',
  title: 'Azure Policy: rules that hold, whoever deploys',
  scene: 'secure-policy',
  narration:
    "Roles decide who may act. Policy decides what any action may create, whoever does it and with whatever tool, and this section tests it, recorded on Azure. The editor shows policy dot t f. Each rule starts as a definition, here two of Azure's built in ones, found by their names: allowed locations, and require a tag on resources. A definition does nothing until it is assigned to a scope with its parameters, and the two assignments put them on the resource group: the U K regions only, and a tag called owner. The side pane draws that chain: a definition, an assignment, and then a deny, which happens before anything is created. The terminal plays the person who skips the rules. The first attempt creates a storage account by hand in West Europe, and Azure refuses it: request disallowed by policy, naming the location rule. The second tries U K South, but with no tags, and is refused again, this time naming the tag rule. Neither command reached the point of creating anything, and the final listing shows the resource group still holds exactly one storage account, the lake. A role would have allowed both commands; the policy stopped them. Next course, the lake itself, and a batch the pipeline can trust.",
}
