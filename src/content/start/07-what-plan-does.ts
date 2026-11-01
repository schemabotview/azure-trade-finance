import type { Section } from '../types'

export const whatPlanDoes: Section = {
  id: 'what-plan-does',
  title: 'What plan does to what is not in code: drift',
  scene: 'start-drift',
  narration:
    "The reshaped code meets Azure, recorded once on the subscription. The first apply reads the moved blocks: the resource group and the storage account have moved to new addresses, and the plan adds nothing, changes nothing and destroys nothing. Then someone changes Azure without touching the code: an a z tag update sets the resource group's owner tag to ops. This is drift, and the next plan finds it: it shows the owner tag going from ops back to trade risk, one resource to change. Apply puts it back, and reading the tag again shows trade risk. The code wins, every time it is applied. The side pane lists the three cases plan can meet. A resource in the code and in the state, changed in Azure, is drift, and plan changes it back: that is what we just saw. A resource in the state but deleted from the code is something Terraform made and is now told to forget, and plan destroys it. And a resource made by hand in Azure, in neither the code nor the state, is invisible to Terraform altogether: plan says nothing, which is why this course makes every resource with code. Next, a budget, so the subscription warns before it spends.",
}
