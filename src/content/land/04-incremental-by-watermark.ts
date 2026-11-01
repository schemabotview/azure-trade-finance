import type { Section } from '../types'

export const incrementalByWatermark: Section = {
  id: 'incremental-by-watermark',
  title: 'Incremental by watermark: copy only what changed',
  scene: 'land-watermark',
  narration:
    "Batch forty one was a full load. Since then, the desk has worked through the whole of the thirty first of October, issuing, amending and closing letters of credit, and copying all of TradeBook every night would copy mostly what the lake already has. So the extractor now keeps a watermark: the end of the last good window, stored as a small blob in the landing container. The first command shows there is none yet, and the second sets it to batch forty one's window end, the point the full load covered. The query underneath asks TradeBook about every row's updated at: four hundred and eighteen L Cs now, the newest changed late on the thirty first. Lookup is the extractor's first step, and it copies nothing. It counts the rows whose updated at is after the watermark, and no later than tonight's window end, two o'clock on the first of November. The window is open at the start and closed at the end, so a row stamped exactly on a boundary belongs to one batch, never two. One hundred and twenty of the four hundred and eighteen changed. The side pane draws it as one line of time: the full load, the watermark, tonight's window, and the next watermark, greyed until batch forty two has been delivered and checked. Next, lookup writes down what it found, before anything is copied.",
}
