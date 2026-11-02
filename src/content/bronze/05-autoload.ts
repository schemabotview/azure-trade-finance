import type { Section } from '../types'

export const autoload: Section = {
  id: 'autoload',
  title: 'Auto Loader’s idea: each file once',
  scene: 'bronze-autoload',
  narration:
    "Every night, new files arrive in landing, and Bronze must read each of them exactly once: never skip one, never read one twice. On Databricks, the tool for that is Auto Loader. This film does not run Databricks, and the label says what stands in for it: open-source Spark, run locally, whose file stream is the mechanism Auto Loader is built on. Databricks adds faster file discovery and schema handling on top; the guarantee is the same. The editor shows the whole idea in a few lines. A stream reads every C S V under landing. It writes the rows to a Delta table. And two options, highlighted, do the work. The checkpoint location is where the stream writes down which files it has read. And available now means: take everything that is there now, then stop. That turns a stream into a nightly batch job, one that remembers. The three terminals at the bottom are three runs, in order. The first finds one file and reads two hundred rows. The second, straight after, reads nothing: the checkpoint already lists that file. Then a second file arrives, and the third run reads only it, two hundred more rows, and the table holds four hundred, each file's rows exactly once. The checkpoint folder now holds two numbered batches, drawn in the side diagram, one per run that found something. This is the same promise Bronze dot p y keeps with its list of batches, made by the engine itself. Next, the Bronze table this course builds.",
}
