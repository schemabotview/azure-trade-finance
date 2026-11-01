import type { Section } from '../types'

export const signingIn: Section = {
  id: 'signing-in',
  title: 'Signing in: an empty subscription and a naming rule',
  scene: 'start-signing-in',
  focus: 'subscription',
  narration:
    "Now Azure. Ana has signed in with a z login, and from here on every frame marked recorded on Azure was run once on a real subscription, with its identifiers replaced before anything was saved. The map is the whole pipeline we will build, and right now every part of it is grey: nothing exists yet. The terminal confirms it. The account shows the subscription, sub tradefin dev, and who is signed in. U K South is the region the pipeline will live in. The search for anything named tradefin returns nothing at all. And the storage provider is registered, so the subscription is allowed to create storage accounts. Before creating anything, two conventions, in the side pane. Every name says what it is, which app it belongs to, and which environment: r g for a resource group, s t for a storage account, k v for a key vault, a d f for Data Factory, then tradefin, then dev. A storage account's name cannot hold hyphens, so it runs together. And every resource carries three tags, each answering a question someone will ask one day: which app is this for, which environment, so can I delete it, and who owns it, so who do I call. Next, the first resource, written as code.",
}
