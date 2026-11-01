import type { Section } from '../types'

export const budgets: Section = {
  id: 'budgets',
  title: 'Budgets: a warning before the money is spent',
  scene: 'start-budget',
  narration:
    "Last in this course, a budget, recorded on Azure. Two resources are added to main dot t f. The first is an action group, a g trade risk: a list of who to tell when something happens, here one email address for the risk team's engineers. The second is a monthly budget on the resource group. Its notification is the highlighted part: when the forecast for the month passes eighty percent of the budget, tell the action group. Forecast, not actual: the forecast is the month's spending so far, projected to the month's end, so the warning comes early enough to act on, not after the money is gone. The terminal applies both, the action group and the budget, and the budget list shows it exists. The side pane draws the chain: the budget, the forecast crossing eighty percent, the action group, and an email. Notice what is missing. A budget warns; it never stops anything. Turning resources off is a decision for a person, or for automation someone has written on purpose, and this course tears its resources down after recording each part, so that nothing waits on the subscription between recordings. Next, before the pipeline holds anything, who is allowed to touch it.",
}
