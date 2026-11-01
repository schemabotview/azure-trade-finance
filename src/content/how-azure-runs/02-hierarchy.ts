import type { Section } from '../types'

export const hierarchy: Section = {
  id: 'hierarchy',
  title: 'The resource hierarchy',
  scene: 'how-azure-runs-hierarchy',
  narration:
    "Everything in Azure lives at one level of a hierarchy, and the side pane draws its five levels. At the top is the tenant: the organisation's Entra I D, the directory that says who exists. Below it are management groups, which apply policy across many subscriptions at once. The recording identity cannot read them, which is normal: a project rarely owns its organisation's top levels. Then the subscription, the level the terminal shows. The first command reads the one this course is signed in to: sub tradefin dev, enabled, inside a tenant whose real I D has been replaced with the plan's placeholder, as every I D in this film is. A subscription is two things at once: the unit Azure sends a bill for, and a boundary for access. The second command lists every subscription the identity can see, and there is just the one. Inside a subscription are resource groups, and the last command asks for any with tradefin in the name. The answer is an empty list. That is deliberate. The subscription is emptied after every course, so the first resource group appears in Course three. Inside resource groups, finally, are resources: a storage account, a key vault, a data factory. The map is drawn with every part dimmed, because none of it exists yet. Next, the one service every command, from every tool, actually talks to.",
}
