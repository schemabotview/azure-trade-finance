import type { Section } from '../types'

export const theQuestion: Section = {
  id: 'the-question',
  title: 'The question: exposure by group, against its limit',
  scene: 'intro-the-question',
  narration:
    "Banks do not set limits on single companies alone. Three companies with one owner are one risk: if the owner fails, all three may fail together. So the risk team sorts every counterparty into a group, and sets each group a limit, in each currency it trades in. The left of the frame follows that for one group. Woodgrove has three companies applying for letters of credit. Their open letters of credit, two point two million, five million and two point five million dollars, all count against one group, Woodgrove, and one limit. The table on the right is the answer, and it is the end of this film: the finished Gold table, exactly as the pipeline we build prints it. For every group and currency: the open exposure, the limit, how much of the limit is used, and whether it is breached. Woodgrove has used ninety seven percent of its ten million dollar limit. Fabrikam is over its euro limit, at one hundred and fourteen percent. Contoso appears twice, once in euros and once in dollars, because amounts in different currencies are never added together. Every number in this table is real output. It comes from a pipeline that reads the bank's trade system, checks the data at four gates, and keeps every version of every letter of credit, so that the desk can trust it at eight in the morning. Next, the pipeline itself, on Azure, in one picture.",
}
