import type { Section } from '../types'

export const g1Fails: Section = {
  id: 'g1-fails',
  title: 'G1 fails: the batch that came up short',
  scene: 'land-g1-fails',
  narration:
    "This is a night that goes wrong, run once and then thrown away, so the course carries on from the manifest. The new file is g one dot p y, the landing gate. It reads the manifest, lists the batch folder, and checks three things: every promised file is there, the columns are the ones declared, and the rows add up to the expected count. Each check prints what it found against what was promised, and the batch passes only if all three match. The copy reads the manifest's window and writes one hundred and seventeen rows. G one compares: one file of one, ten columns of ten, and one hundred and seventeen rows of one hundred and twenty. Fail. The batch is not published, and the watermark has not moved. The side pane tells the story of the night. At two o'clock, lookup counted one hundred and twenty rows in the window. Seven seconds later, the desk amended three letters of credit, and each one's updated at moved past the window's end, out of tonight's batch. When the copy ran, they were no longer in its window. Nothing crashed, and no error was raised: without the gate, a short batch would have flowed on to Bronze and to the morning's numbers. Next, we make the rerun safe.",
}
