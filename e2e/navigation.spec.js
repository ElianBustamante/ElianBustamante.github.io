import { test, expect } from '@playwright/test'
import es from '../src/i18n/locales/es.json' with { type: 'json' }

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('clicking desktop navbar links navigates to sections and updates URL hash', async ({ page }) => {
    const navLinks = [
      { name: es.nav.projects, hash: '#proyectos' },
      { name: es.nav.photography, hash: '#fotografia' },
      { name: es.nav.about, hash: '#sobre-mi' },
      { name: es.nav.contact, hash: '#contacto' },
      { name: es.nav.home, hash: '#inicio' },
    ]

    for (const { name, hash } of navLinks) {
      const link = page.locator('header nav').getByRole('link', { name, exact: true })
      await link.click()
      await expect(page).toHaveURL(new RegExp(`${hash}$`))
      await expect(page.locator(`section${hash}`)).toBeInViewport()
    }
  })

  test('hero CTA button "Ver proyectos" navigates to projects section', async ({ page, browserName }) => {
    test.fixme(
      browserName === 'chromium',
      'In Chromium, clicking an anchor inside <main> fires focusin, which causes App.jsx handleFocusIn to scroll back to section#inicio'
    )
    const projectsBtn = page.getByRole('link', { name: es.hero.ctaProjects })
    await projectsBtn.click()
    await expect(page).toHaveURL(/#proyectos$/)
    await expect(page.locator('section#proyectos')).toBeInViewport()
  })

  test('hero CTA button "Ver fotografía" navigates to photography section', async ({ page, browserName }) => {
    test.fixme(
      browserName === 'chromium',
      'In Chromium, clicking an anchor inside <main> fires focusin, which causes App.jsx handleFocusIn to scroll back to section#inicio'
    )
    const photoBtn = page.getByRole('link', { name: es.hero.ctaPhotography })
    await photoBtn.click()
    await expect(page).toHaveURL(/#fotografia$/)
    await expect(page.locator('section#fotografia')).toBeInViewport()
  })
})
