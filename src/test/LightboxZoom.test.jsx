import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Lightbox from '../components/Lightbox'
import photos from '../data/gallery'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'es' },
  }),
}))

if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = vi.fn()
}
if (!HTMLElement.prototype.releasePointerCapture) {
  HTMLElement.prototype.releasePointerCapture = vi.fn()
}
if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => true)
}

describe('Lightbox Zoom', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.innerWidth = 1024
    window.innerHeight = 768
  })

  it('handles zoom, drag, keyboard, and controls correctly', () => {
    const onClose = vi.fn()
    const onIndexChange = vi.fn()
    
    render(
      <Lightbox
        photos={photos}
        index={0}
        onClose={onClose}
        onIndexChange={onIndexChange}
      />
    )
    
    const img = screen.getByRole('img', { hidden: true })
    const scrollContainer = img.closest('div.relative.flex-1')
    
    const getZoomBtn = () => screen.getAllByRole('button').find(b => b.hasAttribute('aria-pressed'))
    
    // 1. Single click zooms in
    fireEvent.click(img)
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('true')
    
    // 2. Single click while zoomed in zooms out
    fireEvent.click(img)
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('false')
    
    // Enter zoom again for next tests
    fireEvent.click(img)
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('true')
    
    // 3. Drag of more than 4px moves scrollLeft/scrollTop and subsequent click does NOT exit zoom
    fireEvent.pointerDown(scrollContainer, { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(scrollContainer, { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: 90, clientY: 90 }) // Moved 10px
    fireEvent.pointerUp(scrollContainer, { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 0 })
    fireEvent.click(img) // Click after drag
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('true') // Still zoomed
    
    // 4. After a drag, a new click does exit zoom (flag resets on pointerDown)
    fireEvent.pointerDown(scrollContainer, { pointerId: 2, pointerType: 'mouse', button: 0, buttons: 1, clientX: 100, clientY: 100 })
    fireEvent.pointerUp(scrollContainer, { pointerId: 2, pointerType: 'mouse', button: 0, buttons: 0 })
    fireEvent.click(img)
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('false')
    
    // Enter zoom again
    fireEvent.click(img)
    
    // 5. pointerMove without buttons moves nothing and does not activate drag
    fireEvent.pointerMove(scrollContainer, { pointerId: 3, pointerType: 'mouse', button: 0, buttons: 0, clientX: 50, clientY: 50 })
    fireEvent.click(img) // This should successfully zoom out because pointerMove without buttons doesn't activate drag
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('false')
    
    // 6. - and + change zoom level
    fireEvent.click(img) // zoom in to 2.5
    const zoomInBtn = screen.getByRole('button', { name: 'photography.zoomIn' }) // +
    const zoomOutBtn = screen.getAllByRole('button', { name: 'photography.zoomOut' }).find(b => !b.hasAttribute('aria-pressed')) // -
    
    const slider = screen.getByRole('slider')
    expect(slider.value).toBe("2.5")
    
    fireEvent.click(zoomInBtn)
    expect(slider.value).toBe("2.75")
    
    fireEvent.click(zoomOutBtn)
    expect(slider.value).toBe("2.5")
    
    // 7. Controls (close, zoom toggle, prev, next) remain present while zoomed
    expect(screen.getByRole('button', { name: 'photography.close' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'photography.prev' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'photography.next' }).length).toBeGreaterThan(0)
    expect(getZoomBtn()).toBeInTheDocument()
    
    // 8. Escape with active zoom exits zoom without calling onClose
    fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' }) // The component listens to Escape on dialog, not document body. Wait, Lightbox has onKeyDown on the dialog wrapper
    const dialog = screen.getByRole('dialog', { hidden: true }) || scrollContainer.parentElement
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('false')
    expect(onClose).not.toHaveBeenCalled()
    
    // Escape without zoom calls onClose
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
