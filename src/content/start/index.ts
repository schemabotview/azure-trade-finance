import type { Course } from '../types'
import { tradebook } from './01-tradebook'
import { anLcsLife } from './02-an-lcs-life'
import { signingIn } from './03-signing-in'
import { aFirstTerraformFile } from './04-a-first-terraform-file'
import { stateAndWhereItLives } from './05-state-and-where-it-lives'
import { variablesAndModules } from './06-variables-and-modules'
import { whatPlanDoes } from './07-what-plan-does'
import { budgets } from './08-budgets'

// Course 3 · The source, and a first deployment. §1–2 run locally; §6 is compiled; the rest is
// recorded on Azure (Terraform).
export const start: Course = {
  id: 'start',
  title: 'The source, and a first deployment',
  sections: [tradebook, anLcsLife, signingIn, aFirstTerraformFile, stateAndWhereItLives, variablesAndModules, whatPlanDoes, budgets],
}
