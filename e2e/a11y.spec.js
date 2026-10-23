import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import es from '../src/i18n/locales/es.json' with { type: 'json' }

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

test.describe('Accessibility (Axe)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('no accessibility violations on default Spanish page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const results = await new AxeBuilder({ page })
      .withTags(AXE_TAGS)
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('no accessibility violations on English page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const toggleBtn = page.getByRole('button', { name: new RegExp(es.nav.switchToEn, 'i') })
    await toggleBtn.click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    const results = await new AxeBuilder({ page })
      .withTags(AXE_TAGS)
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('no accessibility violations with lightbox open', async ({ page }) => {
    await page.goto('/#fotografia')
    await page.waitForLoadState('domcontentloaded')

    const firstThumb = page.locator('#thumb-0')
    await expect(firstThumb).toBeVisible()
    await firstThumb.click()

    const dialog = page.getByRole('dialog', { name: es.photography.lightboxLabel })
    await expect(dialog).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(AXE_TAGS)
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('keyboard Tab from start reaches brand link with visible focus outline', async ({
    page,
    isMobile,
    browserName,
  }) => {
    test.skip(isMobile, 'Desktop navigation Tab order test is specific to desktop viewports')
    test.skip(
      browserName === 'webkit',
      'WebKit by default skips anchor tags during Tab navigation unless macOS Full Keyboard Access is enabled'
    )

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Tab 1 reaches SectionArrows next section button, Tab 2 reaches the brand link in navbar
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    const brandLink = page.locator('header nav a[href="#inicio"]').first()
    await expect(brandLink).toBeFocused()

    // Verify focus indicator is visible (outline or focus ring)
    const hasFocusRing = await brandLink.evaluate((el) => {
      const style = window.getComputedStyle(el)
      const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
      const hasBoxShadow = style.boxShadow !== 'none' && style.boxShadow.length > 0
      return hasOutline || hasBoxShadow
    })
    expect(hasFocusRing).toBe(true)
  })
})
