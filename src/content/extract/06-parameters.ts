import type { Section } from '../types'

export const parameters: Section = {
  id: 'parameters',
  title: 'Parameters and expressions',
  scene: 'extract-parameters',
  narration:
    "One pipeline definition runs every night, and every night it must read a different window and write a different folder. That is what parameters and expressions are for. A parameter is a value given when a run starts: here, the batch I D and the window's end. An expression, written with an at sign, is evaluated just before an activity runs, and can read parameters and the outputs of earlier activities. This step only looks. The helper finds the extract's last run, and the terminal shows its parameters as Data Factory stored them: batch forty two, and the window's end, which Data Factory hands back in its own date format, as the note points out. Then it asks what the copy activity was actually given, and shows the query with every expression already resolved. After the thirty first of October at two, from the watermark lookup, and up to the first of November at two, from the parameter. The table in the side pane lines the expressions up with what they became. The batch I D became forty two, which also named the folder. The watermark lookup's output became the start of the window. And the window end parameter became its end. The editor shows the two helper commands used to look. Nothing in the definition says which night it is; the run says that. So the last thing missing is something that starts a run, with the right values, every night. Next, triggers.",
}
