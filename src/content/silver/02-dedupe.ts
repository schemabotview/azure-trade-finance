import type { Section } from '../types'

export const dedupe: Section = {
  id: 'dedupe',
  title: 'Deduplicate: a window, newest first, row 1 kept',
  scene: 'silver-dedupe',
  narration:
    "The first version of Silver dot p y does two things. It types the data: Bronze kept every column as a string, and Silver casts them, the dates to dates, the version to an integer, and the amount to decimal eighteen two, because money is never a floating point number. Then it deduplicates, with a window function, highlighted in the editor. The window partitions Bronze by L C I D, so each letter of credit gets its own little group of rows. Inside each group, the rows are ordered by source version, highest first, and when two rows carry the same version, the later batch comes first. Each row is numbered, and only row one is kept. The side pane walks one L C through it. L C twenty forty one has three rows in Bronze: version two from batch forty two, and version one twice, from batch forty one and from the replay in batch forty four. Version two is numbered one and kept; both copies of version one are dropped. The terminal shows the count, nine hundred and twenty three rows in, four hundred and eighteen out, and the last query reads L C twenty forty one back from Silver: version two, two point two million, amended, from batch forty two. That works, but it rebuilds Silver from all of Bronze, every night, and Bronze only grows. Next, updating Silver in place.",
}
