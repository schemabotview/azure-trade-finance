import type { Section } from '../types'

export const charges: Section = {
  id: 'charges',
  title: 'How Azure charges: a month, modelled',
  scene: 'how-azure-runs-charges',
  narration:
    "Azure charges by meters: each service measures something, and each unit has a price. This section models a month of the pipeline, and the label says what that means: the usage is assumed, and the prices are Azure's own, read from the public retail prices A P I when the step was recorded. The editor shows the assumptions. Five gigabytes in the lake. Each night, four Data Factory activity runs on Azure's runtime and one on the bank's self hosted runtime. And a Databricks job with two machines at three quarters of a D B U an hour each, for half an hour, every night for thirty nights. The program asks the A P I for each meter's price in U K South and multiplies. The terminal and the table show the month. Storage costs about ten cents. The activity runs cost twelve cents and four cents, because they are priced per thousand. The D B Us cost six dollars seventy five. In total, seven dollars and one cent, before tax. The table's title carries the caveat that matters: before the virtual machines. A Databricks job also runs on virtual machines, billed on their own meter, and a virtual machine left running all month costs far more than all of this. That is the real lesson of Azure billing: what you leave running is what you pay for. Next course, the source system, and a first deployment.",
}
