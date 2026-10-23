import { test, expect } from '@playwright/test'
import es from '../src/i18n/locales/es.json' with { type: 'json' }

const VIEWPORTS = [
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '844x390 (short landscape)', width: 844, height: 390 },
  { name: '667x375 (short landscape)', width: 667, height: 375 },
]

test.describe('Responsive behavior', () => {
  for (const vp of VIEWPORTS) {
    test(`no horizontal overflow at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      const noOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth
      })
      expect(noOverflow).toBe(true)
    })
  }

  test('mobile menu at 360x800 shows toggle button, hides desktop nav, and opens 5 links', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/')

    const menuBtn = page.getByRole('button', { name: es.nav.menuOpen })
    await expect(menuBtn).toBeVisible()

    const desktopNavLinks = page.locator('header nav .hidden.lg\\:flex')
    await expect(desktopNavLinks.first()).toBeHidden()
    await expect(desktopNavLinks.last()).toBeHidden()

    await menuBtn.click()

    const mobileMenu = page.locator('#mobile-menu')
    await expect(mobileMenu).toBeVisible()

    const sectionHrefs = ['#inicio', '#proyectos', '#fotografia', '#sobre-mi', '#contacto']
    for (const href of sectionHrefs) {
      await expect(mobileMenu.locator(`a[href="${href}"]`).first()).toBeVisible()
    }
    // 5 section links + 1 contact CTA link
    const allLinks = mobileMenu.locator('a')
    await expect(allLinks).toHaveCount(6)
  })

  test('short landscape screens show rail navigation and hide top navbar', async ({ page }) => {
    const shortViewports = [
      { width: 844, height: 390 },
      { width: 667, height: 375 },
    ]

    for (const vp of shortViewports) {
      await page.setViewportSize(vp)
      await page.goto('/')

      const railNav = page.locator('nav.short\\:flex')
      await expect(railNav).toBeVisible()

      const topHeader = page.locator('header.short\\:hidden')
      await expect(topHeader).toBeHidden()

      const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      expect(noOverflow).toBe(true)
    }
  })

  test('gallery photos have equal rendered height across different viewports', async ({ page }) => {
    const testSizes = [
      { width: 360, height: 800 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
      { width: 844, height: 390 },
    ]

    for (const vp of testSizes) {
      await page.setViewportSize(vp)
      await page.goto('/#fotografia')
      // Allow ResizeObserver and layout recalculation to settle
      await page.waitForTimeout(200)

      const list = page.locator('#fotografia ul[role="list"]')
      await expect(list).toBeVisible()
      const photoItems = list.locator('> li')
      await expect(photoItems.first()).toBeVisible()

      const count = await photoItems.count()
      expect(count).toBeGreaterThan(0)

      const firstBox = await photoItems.first().boundingBox()
      expect(firstBox).not.toBeNull()
      const targetHeight = firstBox.height

      // Check first 6 photos rendered in carousel have the same height within 1px
      const sampleCount = Math.min(count, 6)
      for (let i = 0; i < sampleCount; i++) {
        const box = await photoItems.nth(i).boundingBox()
        expect(box).not.toBeNull()
        expect(Math.abs(box.height - targetHeight)).toBeLessThanOrEqual(1)
      }

      // Check carousel container has operable horizontal scroll
      const hasOverflow = await list.evaluate((el) => el.scrollWidth > el.clientWidth)
      expect(hasOverflow).toBe(true)
    }
  })
})
