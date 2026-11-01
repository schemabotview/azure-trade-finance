import type { Section } from '../types'

export const twoEnvironments: Section = {
  id: 'two-environments',
  title: 'Two environments from one module',
  scene: 'operate-two-environments',
  narration:
    "Everything so far has been built in one environment, dev. A bank will want a second, prod, and the risk is that the two drift apart, one hand edit at a time, until prod is something nobody can rebuild. With Terraform the answer is to write the infrastructure once and make the environment a parameter. The label says how far this section goes: the configuration is validated offline, which is real, but prod is not deployed, because prod belongs in its own subscription. The editor shows the one change to the code. The state backend no longer names its state file. The key now comes from a small file per environment, passed to terraform init. The terminal lists the environment folder: for each environment, a backend file naming its state blob, dev dot t f state or prod dot t f state, and a variables file setting env to dev or prod. Every resource name already includes the environment, so the same code makes r g tradefin dev in one and r g tradefin prod in the other. Then terraform validate: the configuration is valid. The side pane draws the shape. One root module, every resource written once. Two pairs of small files. Two state files, so that a plan for dev can never touch prod. And two subscriptions, each with its own access and its own bill. Promoting a change is then just applying the same commit to the other environment. Next, the last section: where this pipeline could go from here.",
}
