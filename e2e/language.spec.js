import { test, expect } from '@playwright/test'
import es from '../src/i18n/locales/es.json' with { type: 'json' }
import en from '../src/i18n/locales/en.json' with { type: 'json' }

test.describe('Language switching and persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('defaults to Spanish with correct html lang, title, and h1 text', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    await expect(page).toHaveTitle(es.meta.title)

    const expectedH1Text = `${es.hero.titleLine1} ${es.hero.titleLine2}`
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()

    const actualText = (await h1.locator('span').allTextContents()).map(s => s.trim()).join(' ')
    expect(actualText).toBe(expectedH1Text)
  })

  test('switches to English when clicking toggle button and persists after reload', async ({ page }) => {
    // Click language toggle button (accessible label has "EN: Cambiar idioma a inglés")
    const toggleButton = page.getByRole('button', { name: new RegExp(es.nav.switchToEn, 'i') })
    await toggleButton.click()

    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page).toHaveTitle(en.meta.title)

    const expectedEnH1Text = `${en.hero.titleLine1} ${en.hero.titleLine2}`
    const h1 = page.locator('h1')
    const actualTextEn = (await h1.locator('span').allTextContents()).map(s => s.trim()).join(' ')
    expect(actualTextEn).toBe(expectedEnH1Text)

    // Reload page and verify persistence
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page).toHaveTitle(en.meta.title)

    // Toggle back to Spanish
    const toggleBackBtn = page.getByRole('button', { name: new RegExp(en.nav.switchToEs, 'i') })
    await toggleBackBtn.click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    await expect(page).toHaveTitle(es.meta.title)
  })
})
