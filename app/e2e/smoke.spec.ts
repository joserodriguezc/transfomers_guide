import { expect, test, type Page } from '@playwright/test'
import { readdirSync } from 'node:fs'

/** Número de módulos del curso = número de MDX en src/course/stages. */
const STAGE_COUNT = readdirSync(new URL('../src/course/stages', import.meta.url)).filter((f) => f.endsWith('.mdx')).length

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  return errors
}

test('todos los módulos cargan sin errores', async ({ page }) => {
  test.setTimeout(5 * 60_000)
  const errors = trackErrors(page)
  await page.goto('/')
  const hrefs = await page.locator('a[href^="#/modulo/"]').evaluateAll((as) =>
    [...new Set(as.map((a) => a.getAttribute('href')!))],
  )
  expect(hrefs.length).toBe(STAGE_COUNT)
  for (const href of hrefs) {
    await page.goto(`/${href}`)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByText('Cargando módulo…')).toHaveCount(0, { timeout: 20_000 })
    // Revela todos los pasos de los ejemplos resueltos y comprueba que no hay LaTeX mal formado
    const reveal = page.getByRole('button', { name: 'Mostrar todo' })
    while ((await reveal.count()) > 0) await reveal.first().click()
    const bad = await page.locator('.katex-error').allTextContents()
    expect(bad, `LaTeX con errores en ${href}`).toEqual([])
    // Las ocho secciones de la plantilla están presentes
    await expect(page.locator('article h2')).toHaveCount(8)
  }
  await page.goto('/#/referencia')
  await expect(page.getByRole('heading', { name: 'Notación y referencia' })).toBeVisible()
  await page.getByLabel('Buscar en el glosario').fill('softmax')
  await expect(page.locator('dd', { hasText: 'probabilidades' }).first()).toBeVisible()
  expect(errors).toEqual([])
})

test('se navega entre módulos sin recargar (menú lateral, siguiente y anterior)', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/#/modulo/atencion')
  await expect(page.locator('main h1')).toHaveText('Atención por producto escalado')

  // Menú lateral
  await page.locator('aside a', { hasText: 'Atención multi-cabeza' }).click()
  await expect(page).toHaveURL(/#\/modulo\/multi-cabeza$/)
  await expect(page.locator('main h1')).toHaveText('Atención multi-cabeza')

  // Botón «siguiente» al pie
  await page.getByRole('link', { name: /Módulo 5 →/ }).click()
  await expect(page.locator('main h1')).toHaveText('El bloque transformer')

  // Botón «anterior» y el índice «En este módulo» se reconstruye
  await page.getByRole('link', { name: /← Módulo 4/ }).click()
  await expect(page.locator('main h1')).toHaveText('Atención multi-cabeza')
  await expect(page.locator('aside').getByText('Formalización')).toBeVisible()

  // Desde la página de inicio
  await page.getByRole('link', { name: 'Curso', exact: true }).click()
  await page.locator('main a', { hasText: 'Modelos de difusión' }).click()
  await expect(page.locator('main h1')).toHaveText('Modelos de difusión')
  expect(errors).toEqual([])
})

test('los pasos del ejemplo resuelto se revelan uno a uno', async ({ page }) => {
  await page.goto('/#/modulo/tokenizacion')
  const next = page.getByRole('button', { name: /Siguiente paso/ })
  await expect(next).toHaveText(/\(1\/5\)/)
  await next.click()
  await expect(next).toHaveText(/\(2\/5\)/)
})

test('una celda de Python se ejecuta con NumPy', async ({ page }) => {
  await page.goto('/#/modulo/atencion')
  const cell = page.locator('figure', { hasText: 'La atención como función reutilizable' })
  await cell.getByRole('button', { name: /Ejecutar/ }).click()
  await expect(cell.locator('pre', { hasText: /^True$/m })).toHaveCount(1, { timeout: 90_000 })
  await expect(cell).not.toContainText('Error')
})

test('el progreso del quiz se guarda', async ({ page }) => {
  await page.goto('/#/modulo/atencion')
  const quiz = page.locator('ol', { has: page.getByText('¿cuántos elementos tiene la matriz') })
  await quiz.locator('li').nth(1).getByRole('textbox').fill('100')
  await page.getByRole('button', { name: /Comprobar respuestas/ }).click()
  await expect(page.getByText(/Resultado: 13%/)).toBeVisible()
  await page.reload()
  await expect(page.getByText(/Mejor puntaje: 13%/)).toBeVisible()
})
