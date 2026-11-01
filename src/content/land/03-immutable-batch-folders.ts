import type { Section } from '../types'

export const immutableBatchFolders: Section = {
  id: 'immutable-batch-folders',
  title: 'Immutable batch folders: one night, one delivery',
  scene: 'land-batch-folders',
  narration:
    "The pipeline's first real job is to land TradeBook's letters of credit in the lake, and land them in a way we can trust later. On Ana's laptop the lake is Azurite, Azure Storage's emulator, and the label at the top of the side pane says so. Extract dot p y reads every L C that TradeBook held up to the window's end, two o'clock on the thirty first of October, and writes them as one C S V file. The path is the idea: the landing container, then lc deals, then a folder named batch I D equals forty one. Each night's copy gets a folder of its own, and the upload refuses to overwrite. The terminal shows both sides of that rule. The first run writes four hundred rows. The same command again, a retry or a careless double click, is refused, because the file already exists. A delivery, once written, never changes under the people reading it. The table in the side pane shows why two numbers are needed. Source version is TradeBook's count of one L C's revisions. The batch I D names the delivery that carried a row. This letter of credit arrives at version one, for two million dollars, in batch forty one; tomorrow its amendment, version two, arrives in batch forty two. Bronze will keep both. Next, we stop copying everything, and copy only what changed.",
}
