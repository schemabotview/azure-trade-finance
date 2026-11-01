import type { Section } from '../types'

export const referenceFiles: Section = {
  id: 'reference-files',
  title: 'Reference files: mapping and limits on their own path',
  scene: 'land-reference',
  narration:
    "Two files do not come from TradeBook at all. TradeBook knows legal entities, each company that applies for a letter of credit, but only the risk team knows which entities belong together as one group, and what each group may borrow. Those two facts arrive as files from the risk team, sitting in the project's reference folder. The terminal shows the first lines of the mapping: three Woodgrove companies, all in the Woodgrove group. Reference dot p y publishes both files to their own container, reference, in a folder named for the date they hold for, as of the thirty first of October. They are not deliveries in the landing sense: no watermark, no batch number, and they never pass through Bronze. The listing confirms the two paths. The side pane shows why the zones are separate. On the left, TradeBook's letters of credit go to landing, then Bronze, which keeps every version, then Silver. On the right, the risk team's files go to the reference zone, and Silver reads them directly, after checking them itself in Course nine. Below is the limits file as the lake now holds it: Woodgrove, ten million dollars; Contoso in two currencies, never added together; Fabrikam, three million euros; Northwind, eight million dollars. Next, who is allowed to read a batch.",
}
