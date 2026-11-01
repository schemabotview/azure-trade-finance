import type { Section } from '../types'

export const tradebook: Section = {
  id: 'tradebook',
  title: 'TradeBook: the system the pipeline reads',
  scene: 'start-tradebook',
  narration:
    "Every number this pipeline will publish starts in one place: TradeBook, the trade finance desk's own database. On Ana's laptop it is a local PostgreSQL copy, filled by the course's data generator, and everything in this frame runs locally. The schema in the editor has three tables, and the side pane draws them. Counterparty holds the desk's clients, each a legal entity; notice there is no group here, because TradeBook does not know which companies belong together. L C deals holds one row per letter of credit, and only its current version: when an L C is amended, its row is overwritten. L C amendments keeps every version an L C has ever had. Two columns in L C deals carry the whole pipeline, and they are highlighted. Source version counts an L C's revisions, one, two, three. Updated at records when the row last changed, and it is indexed, because every night we will ask for the rows that changed since the night before. The terminal creates the tables, loads the seed, and counts the L Cs by status: four hundred in all, most of them already finished, expired, closed or cancelled, and the rest still open. Next, one letter of credit's whole life.",
}
