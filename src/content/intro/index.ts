import type { Course } from '../types'
import { aLetterOfCredit } from './01-a-letter-of-credit'
import { theQuestion } from './02-the-question'
import { whatWeBuild } from './03-what-we-build'

// Course 1 · Trade finance, and what we'll build.
export const intro: Course = {
  id: 'intro',
  title: 'Trade finance, and what we’ll build',
  sections: [aLetterOfCredit, theQuestion, whatWeBuild],
}
