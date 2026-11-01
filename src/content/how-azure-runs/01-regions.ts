import type { Section } from '../types'

export const regions: Section = {
  id: 'regions',
  title: 'Regions, pairs and zones',
  scene: 'how-azure-runs-regions',
  narration:
    "Before building anything on Azure, it helps to know where it runs. Every command in this course was run once against a real subscription, signed in as the course's own service principal, and the terminal on the right is that recording. The first command counts Azure's physical regions: sixty three. A region is a set of datacenters with one name. Ours is U K South, in London, and the frame draws it inside its geography, the United Kingdom: a geography matters to a bank, because it says where the data may live. The second command lists the U K's regions and their pairs. U K South is paired with U K West, in Cardiff, and U K West with U K South. A pair is two regions in one geography that Azure treats as partners: platform updates roll out to one at a time, and in a wide outage one is recovered first. The last command shows U K South's availability zones: one, two and three. A zone is one or more datacenters with their own power, cooling and network, so a fault in one zone leaves the others running. Notice the second column. Zone one for this subscription is the physical zone az three: each subscription's zone numbers are shuffled, so zone one means different buildings to different customers. The table at the bottom keeps the four words. Next, how the things we build are organised, from the tenant down.",
}
