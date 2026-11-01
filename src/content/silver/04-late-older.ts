import type { Section } from '../types'

export const lateOlder: Section = {
  id: 'late-older',
  title: 'The late older version never wins',
  scene: 'silver-late-older',
  narration:
    "Batch forty four is the replayed file from the last course: the same four hundred rows as batch forty one, delivered again under a new name. Bronze kept them, as it should. Now they reach Silver, and this is where the condition on the update earns its place. Silver dot p y runs again and merges the batch that is new to it, batch forty four. The terminal shows the result: four hundred rows, nothing inserted, nothing updated, four hundred ignored. Every L C I D matched, so nothing was new. And for every one of them, the incoming version was equal to or older than the one Silver holds, so the update condition was false, and the row was left alone. The side pane follows L C twenty forty one through its three deliveries. Batch forty one inserted version one at two million. Batch forty two updated it to version two, two point two million, because two is greater than one. Batch forty four brings version one again, and one is not greater than two: ignored. The last query confirms that Silver still says version two. Without that condition, an old file delivered late would quietly roll Silver back to yesterday, and nothing would fail. An equal or older version never wins, whatever order the files arrive in. Next, a look inside the Delta table, at how it remembers every one of these merges.",
}
