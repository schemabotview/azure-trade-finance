import type { Section } from '../types'

export const theManifest: Section = {
  id: 'the-manifest',
  title: 'The manifest: a batch’s promise, written first',
  scene: 'land-manifest',
  narration:
    "Lookup now leaves something behind: a manifest, a small J SON file in batch forty two's folder. It is written first, before a single row is copied, and that order is the point. The highlighted lines build it from what lookup just learned. The window, with its start and its end. The number of rows the copy must deliver, one hundred and twenty. The files the batch will hold, one C S V. And the table's columns with their PostgreSQL types, read from the database's own catalogue, so a column that disappears or changes type upstream will show up as a difference rather than a surprise. The terminal shows lookup writing it, and the listing beneath shows the landing container: batch forty one's file, and batch forty two's folder, holding only the manifest so far. In the side pane is the blob itself, read back from the lake: the batch, the window, one hundred and twenty expected rows, one file, and ten typed columns, folded in the middle. Above it, the order of the night. Lookup writes the promise. The copy, still to come, writes the data. And the gate called G one will hold the folder to the promise before anything downstream may read it. Next, the copy runs, on a night when the promise is not kept.",
}
