import type { Section } from '../types'

export const variablesAndModules: Section = {
  id: 'variables-and-modules',
  title: 'Variables and modules: one shape, any environment',
  scene: 'start-modules',
  narration:
    "The first file named everything by hand: dev appeared in every name. Production will need the same resources with different names, so the code is reshaped, and this frame is compiled: it runs offline, and deploys nothing. Main dot t f now takes one variable, e n v, and builds every name from it: r g tradefin, then the environment. The tags are written once, in locals, and passed on. The storage account moves into a module of its own, modules slash storage, which takes four inputs: a name, a resource group, a location and tags. The dev values live in a small file, envs slash dev dot t f vars, with one line: env equals dev. The two blocks at the bottom matter more than they look. The resources now have new addresses in the code, and without being told, Terraform would destroy the old ones and create new ones. Moved blocks tell it that these are the same resources under new names. The terminal checks the work without touching Azure: format reports the files are formatted, init with no backend fetches the provider, and validate finds the configuration valid. The listing shows the new tree, and the side pane draws it: the variables file, the root module, the storage module. Next, applying it, and what plan does to change made outside the code.",
}
