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
    
    // 1. Clic simple amplía
    fireEvent.click(img)
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('true')
    
    // 2. Clic simple sobre la ampliada sale
    fireEvent.click(img)
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('false')
    
    // Enter zoom again for next tests
    fireEvent.click(img)
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('true')
    
    // 3. Arrastre de más de 4px mueve scrollLeft/scrollTop y el click posterior NO sale del zoom
    fireEvent.pointerDown(scrollContainer, { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(scrollContainer, { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: 90, clientY: 90 }) // Moved 10px
    fireEvent.pointerUp(scrollContainer, { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 0 })
    fireEvent.click(img) // Click after drag
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('true') // Still zoomed
    
    // 4. Después de un arrastre, un nuevo clic sí sale (el flag se reinicia en pointerDown)
    fireEvent.pointerDown(scrollContainer, { pointerId: 2, pointerType: 'mouse', button: 0, buttons: 1, clientX: 100, clientY: 100 })
    fireEvent.pointerUp(scrollContainer, { pointerId: 2, pointerType: 'mouse', button: 0, buttons: 0 })
    fireEvent.click(img)
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('false')
    
    // Enter zoom again
    fireEvent.click(img)
    
    // 5. pointerMove sin buttons no mueve nada ni activa el arrastre
    fireEvent.pointerMove(scrollContainer, { pointerId: 3, pointerType: 'mouse', button: 0, buttons: 0, clientX: 50, clientY: 50 })
    fireEvent.click(img) // This should successfully zoom out because pointerMove without buttons doesn't activate drag
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('false')
    
    // 6. - y + cambian el nivel
    fireEvent.click(img) // zoom in to 2.5
    const zoomInBtn = screen.getByRole('button', { name: 'photography.zoomIn' }) // +
    const zoomOutBtn = screen.getAllByRole('button', { name: 'photography.zoomOut' }).find(b => !b.hasAttribute('aria-pressed')) // -
    
    const slider = screen.getByRole('slider')
    expect(slider.value).toBe("2.5")
    
    fireEvent.click(zoomInBtn)
    expect(slider.value).toBe("2.75")
    
    fireEvent.click(zoomOutBtn)
    expect(slider.value).toBe("2.5")
    
    // 7. Los controles (cerrar, lupa, prev, next) siguen presentes con zoom
    expect(screen.getByRole('button', { name: 'photography.close' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'photography.prev' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'photography.next' }).length).toBeGreaterThan(0)
    expect(getZoomBtn()).toBeInTheDocument()
    
    // 8. Escape con zoom sale del zoom sin llamar a onClose
    fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' }) // The component listens to Escape on dialog, not document body. Wait, Lightbox has onKeyDown on the dialog wrapper
    const dialog = screen.getByRole('dialog', { hidden: true }) || scrollContainer.parentElement
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
    expect(getZoomBtn().getAttribute('aria-pressed')).toBe('false')
    expect(onClose).not.toHaveBeenCalled()
    
    // Escape sin zoom llama a onClose
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
