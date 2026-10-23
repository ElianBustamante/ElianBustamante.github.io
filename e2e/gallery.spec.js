import { test, expect } from '@playwright/test'
import photos from '../src/data/photos.json' with { type: 'json' }
import es from '../src/i18n/locales/es.json' with { type: 'json' }

test.describe('Photo Gallery and Lightbox', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(photos.length === 0, 'Skipping because photos.json is empty')
    await page.goto('/#fotografia')
  })

  test('"Más fotos" button scrolls the gallery horizontally', async ({ page }) => {
    const list = page.locator('#fotografia ul[role="list"]')
    await expect(list).toBeVisible()

    const initialScroll = await list.evaluate((el) => el.scrollLeft)
    const nextBtn = page.getByRole('button', { name: es.photography.scrollNext })
    await expect(nextBtn).toBeVisible()
    await nextBtn.click()

    await expect.poll(async () => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(initialScroll)
  })

  test('clicking first photo opens lightbox, arrow keys change photos, and Escape closes', async ({
    page,
  }) => {
    const total = photos.length
    const firstThumb = page.locator('#thumb-0')
    await expect(firstThumb).toBeVisible()
    await firstThumb.click()

    const dialog = page.getByRole('dialog', { name: es.photography.lightboxLabel })
    await expect(dialog).toBeVisible()

    // Verify counter shows initial photo
    const counter1Text = es.photography.counter.replace('{{current}}', '1').replace('{{total}}', String(total))
    await expect(dialog.getByText(counter1Text)).toBeVisible()

    // Press ArrowRight to go to next photo
    await page.keyboard.press('ArrowRight')
    const counter2Text = es.photography.counter.replace('{{current}}', '2').replace('{{total}}', String(total))
    await expect(dialog.getByText(counter2Text)).toBeVisible()

    // Press ArrowLeft to return to first photo
    await page.keyboard.press('ArrowLeft')
    await expect(dialog.getByText(counter1Text)).toBeVisible()

    // Press Escape to close dialog
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
  })

  test('closing lightbox restores focus to thumbnail button', async ({ page }) => {
    const firstThumb = page.locator('#thumb-0')
    await firstThumb.click()
    const dialog = page.getByRole('dialog', { name: es.photography.lightboxLabel })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(firstThumb).toBeFocused()
  })

  test('navigating in lightbox to distant photo and closing restores focus without scrolling carousel back', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop carousel scroll test is specific to desktop viewports')

    const list = page.locator('#fotografia ul[role="list"]')
    await expect(list).toBeVisible()

    const total = photos.length
    const lastIndex = total - 1
    const lastThumb = page.locator(`#thumb-${lastIndex}`)

    // Scroll to the end of the carousel
    await list.evaluate((el) => {
      el.scrollLeft = el.scrollWidth
    })
    await expect(lastThumb).toBeVisible()

    // Open the last photo
    await lastThumb.click()
    const dialog = page.getByRole('dialog', { name: es.photography.lightboxLabel })
    await expect(dialog).toBeVisible()

    const lastCounterText = es.photography.counter
      .replace('{{current}}', String(total))
      .replace('{{total}}', String(total))
    await expect(dialog.getByText(lastCounterText)).toBeVisible()

    // Press ArrowRight to wrap around to the first photo
    await page.keyboard.press('ArrowRight')
    const firstCounterText = es.photography.counter
      .replace('{{current}}', '1')
      .replace('{{total}}', String(total))
    await expect(dialog.getByText(firstCounterText)).toBeVisible()

    // Wait for carousel background sync effect to align thumbnail
    await page.waitForTimeout(200)
    const scrollBeforeClose = await list.evaluate((el) => el.scrollLeft)

    // Press Escape to close
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()

    // (i) Focused element is the first photo thumbnail
    const firstThumb = page.locator('#thumb-0')
    await expect(firstThumb).toBeFocused()

    // (ii) Carousel scrollLeft does not jump back to the last page
    await expect.poll(async () => {
      const currentScroll = await list.evaluate((el) => el.scrollLeft)
      return Math.abs(currentScroll - scrollBeforeClose)
    }).toBeLessThanOrEqual(50)
  })
})
