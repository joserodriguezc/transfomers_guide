import { PyCell } from './components/code/PyCell'
import { Callout, Figure, Formula, KeyTakeaways, Problem, Section, Step, WorkedExample } from './components/lesson/blocks'
import { StageRef } from './components/lesson/StageRef'
import { Tex } from './components/lesson/Tex'
import { Quiz } from './components/quiz/Quiz'
import * as viz from './components/viz'

/** Componentes disponibles en todos los MDX sin necesidad de importarlos. */
export const mdxComponents = {
  Section,
  Formula,
  WorkedExample,
  Step,
  Problem,
  Callout,
  KeyTakeaways,
  Figure,
  Tex,
  StageRef,
  PyCell,
  Quiz,
  ...viz,
}
