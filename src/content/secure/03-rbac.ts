import type { Section } from '../types'

export const rbac: Section = {
  id: 'rbac',
  title: 'RBAC: who, what, and where it applies',
  scene: 'secure-rbac',
  narration:
    "This detour draws how Azure decides what anyone may do, and every value in it was recorded on the subscription. A role assignment has exactly three parts, listed at the bottom right. Who: a principal, here the pipeline's identity. What: a role, which is a named list of allowed actions; Reader allows looking at anything and changing nothing. And where: a scope. The Terraform block grants Reader on the resource group. The left side is the scope hierarchy, nested the way Azure nests it. The outer box is the subscription. Two assignments live there, both Owner: the subscription's owner, and the service principal recording this course. Inside it is the resource group, which holds one assignment of its own, the new Reader. The terminal asks each scope in turn. At the subscription: Owner, Owner. At the resource group: only Reader. Then the same group, with inherited assignments included: Owner, Owner and Reader. That last list is the rule to remember. A role granted at a scope applies to everything beneath it, so an Owner of the subscription is an Owner of every resource group and every resource in it, without a single assignment at those levels. Granting high in the tree is easy, and it is how access quietly grows too wide. Next, a surprise: what Owner cannot do.",
}
