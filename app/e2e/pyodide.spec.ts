import { expect, test } from '@playwright/test'

/**
 * Ejecuta en el navegador (Pyodide) todas las celdas de Python de cada módulo.
 * Las celdas con `# expect-error:` deben fallar; el resto no.
 * Es lento (descarga NumPy, SciPy, scikit-learn…): `npm run test:e2e -- pyodide`.
 */
test('todas las celdas de Python se ejecutan en Pyodide', async ({ page }) => {
  test.setTimeout(15 * 60_000)
  await page.goto('/')
  const hrefs = await page.locator('a[href^="#/modulo/"]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')!))])
  const failures: string[] = []

  for (const href of hrefs) {
    await page.goto(`/${href}`)
    await expect(page.getByText('Cargando módulo…')).toHaveCount(0, { timeout: 20_000 })
    const cells = page.locator('figure:has(.cm-editor)')
    const n = await cells.count()
    for (let i = 0; i < n; i++) {
      const cell = cells.nth(i)
      const title = await cell.locator('figcaption').innerText()
      const code = await cell.locator('.cm-content').innerText()
      await cell.getByRole('button', { name: /Ejecutar/ }).click()
      await expect(cell.getByRole('button', { name: /Ejecutar/ })).toBeEnabled({ timeout: 180_000 })
      const errors = await cell.locator('pre.text-red-700').allInnerTexts()
      const expectsError = code.includes('expect-error')
      if (expectsError && errors.length === 0) failures.push(`${href} · ${title}: se esperaba un error`)
      if (!expectsError && errors.length > 0) failures.push(`${href} · ${title}: ${errors.join(' ').slice(-300)}`)
    }
  }
  expect(failures).toEqual([])
})
