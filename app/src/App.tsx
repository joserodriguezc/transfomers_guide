import { useEffect } from 'react'
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { usePythonStatus } from './components/code/usePyodide'
import { useTheme } from './lib/theme'
import { Home } from './pages/Home'
import { Reference } from './pages/Reference'
import { StagePage } from './pages/StagePage'

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/modulo/:slug" element={<StagePage />} />
        <Route path="/referencia" element={<Reference />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  )
}

function Header() {
  const { theme, toggle } = useTheme()
  const py = usePythonStatus()
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-600 font-mono text-sm text-white">Tf</span>
          <span className="hidden sm:inline">Guía de Transformers</span>
        </Link>
        <nav className="flex gap-1 text-sm">
          <NavLink to="/" end className={({ isActive }) => navCls(isActive)}>
            Curso
          </NavLink>
          <NavLink to="/referencia" className={({ isActive }) => navCls(isActive)}>
            Notación y referencia
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {py.state !== 'idle' && (
            <span className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex" title="Intérprete de Python en el navegador (Pyodide)">
              <span
                className={`size-2 rounded-full ${py.state === 'ready' ? 'bg-emerald-500' : py.state === 'error' ? 'bg-red-500' : 'animate-pulse bg-amber-500'}`}
              />
              {py.state === 'ready' ? 'Python listo' : py.state === 'error' ? 'Error de Python' : (py.detail ?? 'Cargando Python…')}
            </span>
          )}
          <button
            type="button"
            onClick={toggle}
            className="rounded-md p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  )
}

const navCls = (active: boolean) =>
  `rounded-md px-3 py-1.5 ${active ? 'bg-slate-100 font-medium dark:bg-slate-800' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'}`

/** Al cambiar de página, vuelve arriba (la navegación por hash conserva el scroll). */
function ScrollToTop() {
  const { pathname } = useLocation()
  // Llaves obligatorias: en Chromium recientes scrollTo devuelve una Promise, y React la tomaría por función de limpieza
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
