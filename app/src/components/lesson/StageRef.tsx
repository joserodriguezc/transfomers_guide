import { Link } from 'react-router-dom'
import { stageBySlug } from '../../course/curriculum'

/**
 * Referencia a otra etapa por su slug. Muestra «etapa N» (o solo «N» con `bare`) con el número
 * calculado a partir del orden del curso, así que nunca queda desactualizada al insertar etapas.
 */
export function StageRef({ slug, bare = false }: { slug: string; bare?: boolean }) {
  const s = stageBySlug(slug)
  return (
    <Link to={`/modulo/${s.slug}`} title={s.title} className="font-medium text-brand-700 underline decoration-dotted underline-offset-2 dark:text-brand-100">
      {bare ? s.n : `módulo ${s.n}`}
    </Link>
  )
}
