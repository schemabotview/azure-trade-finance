import type { Section } from '../types'

export const whereTheMoneyGoes: Section = {
  id: 'where-the-money-goes',
  title: 'Where the money goes',
  scene: 'operate-where-the-money-goes',
  narration:
    "Every resource in this film has used something billable, and Azure records each use as a usage record: which resource, which product, how much. The Consumption A P I reads them, and the terminal does, filtered, as always, to this course's own resources. The first command counts the records by product, and the list is a fair summary of the whole film: private D N S and private link from Course six, the lake's storage, a little bandwidth between regions, the N A T gateway that gives the bank's network its way out, public addresses, and Key Vault. The second command shows one record in full, and the table in the side pane repeats it: a product, then a quantity and a cost, both reported as none. That is not a mistake in the query. This subscription is a free trial, and its offer reports what was used, but not what it cost, through this A P I. On a paid subscription the same records carry the price, and the same query, grouped by product, is the month's bill. Until then, the honest way to put numbers on it is the way Course two and Course eight did: Azure's own retail prices, multiplied by usage stated as assumptions. Either way, the lesson from Course two holds: you pay for what you leave running, which is why every course in this film ends with the subscription empty. Next, two environments from one module.",
}
