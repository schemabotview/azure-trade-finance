import type { Section } from '../types'

export const containersAsZones: Section = {
  id: 'containers-as-zones',
  title: 'Containers as zones: landing, bronze, silver, gold, reference',
  scene: 'land-zones',
  focus: 'storage',
  narration:
    "Inside the account, the lake is divided into zones, and each zone is a container, which A D L S calls a file system. On the map, all five now have colour inside the storage account. The Terraform is one resource block with a for each over five names, so the list of zones lives in exactly one place. Like the account, the containers are made through the control plane, the management A P I. Terraform plans five additions and applies them. Then the session switches to the data plane, signed in as the same identity, with no key: the listing returns the five zones. Next, one command creates a directory inside landing, lc deals, then batch I D equals forty two, and the listing beneath shows two directories, the parent and the child, made in one call. On a flat namespace there would be nothing to list until a file existed. The table on the right says what each zone will hold, and when the course fills it. Landing receives TradeBook's batches exactly as delivered. Bronze keeps every version received. Silver keeps one current row per letter of credit. Gold holds the answer, exposure by group and currency. And reference holds the risk team's mapping and limits. Each zone has one job, so each can have its own access rules and its own retention. Next, a batch lands in landing.",
}
