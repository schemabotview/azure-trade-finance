import type { Section } from '../types'

export const perCurrency: Section = {
  id: 'per-currency',
  title: 'Per currency: Contoso has two rows, never one',
  scene: 'gold-per-currency',
  narration:
    "The aggregate table, agg group exposure, sums the fact table into one row per group. Except that is not quite right, and the highlighted line in the editor says why: it groups by group name and currency. Contoso has letters of credit in euros and in dollars, so Contoso gets two rows. The side pane draws them: three point one million euros, and four point eight five million dollars. The tempting thing is to add them and report one figure for Contoso, and there is no correct way to do it. Adding them as they stand mixes two units. Converting first needs an exchange rate, and a rate is a market price at a moment, not something the desk's limits were set in. This repository holds to that as an invariant: amounts in different currencies are never summed. The terminal shows the whole aggregate: Contoso in both currencies, Fabrikam three point four two million euros, Northwind six point three seven five million dollars, and Woodgrove nine point seven million dollars, the same figure the fact rows added up to. The aggregate keeps only rows with a group, so the unmapped letter of credit is not in any of them; G three is what keeps that from passing quietly. And the risk team's limits are set per currency too, so each of these rows will be compared with its own limit. Before that, a word about the type these amounts are kept in.",
}
