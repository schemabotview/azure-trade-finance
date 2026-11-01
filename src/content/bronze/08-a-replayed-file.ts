import type { Section } from '../types'

export const aReplayedFile: Section = {
  id: 'a-replayed-file',
  title: 'A replayed file: Bronze keeps both, and that is right',
  scene: 'bronze-replay',
  narration:
    "One more delivery arrives overnight: batch forty four. Its file is batch forty one's, re-sent under a new batch number, the kind of thing that happens when a job is restarted by hand. Every row in it passes G two, because every row is valid. Bronze dot p y has not changed, and the terminal shows what it does: batch forty four, four hundred rows appended. The query for our letter of credit now returns three rows: version one from batch forty one, version two from batch forty two, and version one again, from batch forty four. A table that is meant to answer how much is owed now holds the same version twice, and an older version arriving after a newer one. It looks like a mistake to keep it, and the side pane explains why it is not. Bronze answers one question: what arrived, when, and from where. Asked whether batch forty four was a re-send, Bronze can say yes, and prove it. Deduplicating here would erase that evidence, and the next time something odd arrived, nobody could tell what had happened. Deciding what is true, one current row per letter of credit, is a different question, with its own rules, and it belongs to the next layer. Next course: Silver, and one true row per L C.",
}
