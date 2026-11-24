import { createContext, useContext } from 'react'

/** Etapa que se está mostrando (la provee StagePage; la usan Quiz y otros componentes del MDX). */
export const StageContext = createContext<string | null>(null)

export function useCurrentStage(): string {
  const slug = useContext(StageContext)
  if (!slug) throw new Error('Este componente debe usarse dentro de una etapa')
  return slug
}
