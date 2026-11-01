import type { Section } from '../types'

export const watermark: Section = {
  id: 'watermark',
  title: 'The watermark pipeline',
  scene: 'extract-watermark',
  narration:
    "Off screen, the desk's business day has reached TradeBook: the same day that made batch forty two in Course five. Now the nightly pipeline, p l extract, does on Azure what extract dot p y did locally, and the side pane walks its activities in order. First, a lookup reads the watermark from landing: the end of the last good window, two in the morning on the thirty first. Next, a second lookup counts TradeBook's rows changed after the watermark and up to the window's end. Then the copy lands exactly those rows, as batch forty two. Then G one, an if condition, compares the two numbers. If they are equal, the batch is complete: a seal file is written, and only then does the watermark move to the window's end. If they differ, a fail activity stops the run with G one's message, and the watermark stays where it was, so tomorrow's run asks again. The editor shows the start of the file, the watermark lookup. The terminal shows the run: one hundred and twenty rows in the window, one hundred and twenty copied, G one succeeded, sealed, and the watermark committed. These are the same numbers as batch forty two on Ana's laptop, because it is the same data and the same rule. What has changed is where it runs: in the bank's network, on a schedule-ready service, with every step recorded. Next, how one pipeline definition becomes a different query every night.",
}
