import { render, screen, cleanup, fireEvent, createEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Lightbox from '../components/Lightbox'
import React from 'react'
import i18n from '../i18n'

const mockPhotos = [
  { id: '1', thumb: { src: '/t1.webp' }, large: { src: '/1.webp', width: 100, height: 100 }, alt: { es: 'F1', en: 'P1' }, exif: { camera: 'Cam' }, title: { es: 'T1' } },
  { id: '2', thumb: { src: '/t2.webp' }, large: { src: '/2.webp', width: 100, height: 100 }, alt: { es: 'F2', en: 'P2' }, exif: { camera: null, lens: null }, title: null },
  { id: '3', thumb: { src: '/t3.webp' }, large: { src: '/3.webp', width: 100, height: 100 }, alt: { es: 'F3', en: 'P3' }, exif: { iso: 100 }, title: null }
]

describe('Lightbox', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('es')
  })
  afterEach(() => {
    cleanup()
  })

  it('renders photo and counter', () => {
    render(<Lightbox photos={mockPhotos} index={0} onClose={() => {}} onIndexChange={() => {}} />)
    expect(screen.getByText('Foto 1 de 3')).toBeInTheDocument()
    expect(screen.getByAltText('F1')).toBeInTheDocument()
    expect(screen.getByText('T1')).toBeInTheDocument()
  })

  it('ArrowRight advances, ArrowLeft goes back, with wrap-around', async () => {
    const onIndexChange = vi.fn()
    render(<Lightbox photos={mockPhotos} index={0} onClose={() => {}} onIndexChange={onIndexChange} />)
    
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' })
    expect(onIndexChange).toHaveBeenCalledWith(1)
    
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowLeft' })
    expect(onIndexChange).toHaveBeenCalledWith(2) // Wrap around from 0 to 2
  })

  it('close button calls onClose', async () => {
    const onClose = vi.fn()
    render(<Lightbox photos={mockPhotos} index={0} onClose={onClose} onIndexChange={() => {}} />)
    
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('no <dl> exists if all EXIF are null', () => {
    render(<Lightbox photos={mockPhotos} index={1} onClose={() => {}} onIndexChange={() => {}} />)
    // dl renders if there is EXIF, check if dt exists
    expect(screen.queryByRole('term')).not.toBeInTheDocument()
  })

  it('adds overflow-hidden on mount and removes on unmount', () => {
    const { unmount } = render(<Lightbox photos={mockPhotos} index={0} onClose={() => {}} onIndexChange={() => {}} />)
    expect(document.documentElement.classList.contains('overflow-hidden')).toBe(true)
    
    unmount()
    expect(document.documentElement.classList.contains('overflow-hidden')).toBe(false)
  })

  it('una foto tiene draggable="false" y un fireEvent.contextMenu sobre ella devuelve defaultPrevented', () => {
    render(<Lightbox photos={mockPhotos} index={0} onClose={() => {}} onIndexChange={() => {}} />)
    const img = screen.getByAltText('F1')
    expect(img).toHaveAttribute('draggable', 'false')
    const event = createEvent.contextMenu(img)
    fireEvent(img, event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('incluye clases short para figure, img y figcaption', () => {
    const { container } = render(<Lightbox photos={mockPhotos} index={0} onClose={() => {}} onIndexChange={() => {}} />)
    const figure = container.querySelector('figure')
    expect(figure.className).toContain('short:py-1!')
    expect(figure.className).toContain('short:justify-center!')
    expect(figure.className).toContain('[@media(max-height:440px)]:short:pt-5!')
    expect(figure.className).toContain('justify-center')
    expect(figure.className).toContain('py-2')
    expect(figure.className).toContain('md:pt-11')
    expect(figure.className).toContain('md:pb-2')
    expect(figure.className).not.toContain('md:py-6')

    const img = screen.getByAltText('F1')
    expect(img.className).toContain('compact:max-h-[calc(100dvh-3.5rem)]!')
    expect(img.className).toContain('[@media(min-height:441px)]:compact:max-h-[calc(100dvh-4.5rem)]!')
    expect(img.className).toContain('[@media(min-height:521px)]:short:max-h-[calc(100dvh-6.5rem)]!')
    expect(img.className).toContain('short:m-0!')
    expect(img.className).toContain('[@media(min-height:441px)]:compact:mt-4!')
    expect(img.className).toContain('max-h-[60dvh]')
    expect(img.className).toContain('md:max-h-[80dvh]')

    const figcaption = container.querySelector('figcaption')
    expect(figcaption.className).toContain('short:mt-2!')
    expect(figcaption.className).toContain('[@media(min-height:521px)]:short:absolute')
    expect(figcaption.className).toContain('[@media(min-height:521px)]:short:inset-x-0')
    expect(figcaption.className).toContain('[@media(min-height:521px)]:short:bottom-1')
    expect(figcaption.className).not.toContain('short:left-0')
    expect(figcaption.className).not.toContain('short:mt-0!')
    expect(figcaption.className).toContain('short:items-baseline')
    expect(figcaption.className).toContain('short:gap-3')

    const separator = screen.getByText('—')
    expect(separator.className).toContain('short:inline-block')

    const dataLine = figcaption.querySelector('div.flex')
    expect(dataLine.className).toContain('mt-2')
    expect(dataLine.className).toContain('short:mt-0')
    expect(dataLine.className).not.toContain('md:mt-3')

    const counterSpan = screen.getByText('Foto 1 de 3')
    expect(counterSpan.className).not.toContain('short:font-semibold')
  })

  it('en pantallas altas (min-height:800px) sube un escalón el tamaño del título y la línea de datos', () => {
    const { container } = render(<Lightbox photos={mockPhotos} index={0} onClose={() => {}} onIndexChange={() => {}} />)
    const title = screen.getByText('T1')
    expect(title.className).toContain('[@media(min-height:800px)]:text-base')
    expect(title.className).toContain('short:text-[12px]')

    const dataLine = container.querySelector('figcaption div.flex')
    expect(dataLine.className).toContain('[@media(min-height:800px)]:text-xs')
    expect(dataLine.className).toContain('short:text-[11px]')
  })

  it('mantiene el modo zoom y el slider al bajar al mínimo, y sale con el botón de zoom o Escape', () => {
    const onClose = vi.fn()
    render(<Lightbox photos={mockPhotos} index={0} onClose={onClose} onIndexChange={() => {}} />)

    const toggleBtn = screen.getByRole('button', { name: 'Ampliar' })
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false')

    // (a) al pulsar el botón de zoom aparece el slider y aria-pressed pasa a "true"
    fireEvent.click(toggleBtn)
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true')
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()

    // (d) el slider tiene max="4" y step="any"
    expect(slider).toHaveAttribute('max', '4')
    expect(slider).toHaveAttribute('step', 'any')

    // (b) fireEvent.change del slider a un valor menor que min (0.1) mantiene el slider en el documento y el valor queda acotado a min
    fireEvent.change(slider, { target: { value: '0.1' } })
    expect(screen.getByRole('slider')).toBeInTheDocument()
    expect(slider.value).toBe(slider.min)

    // Subimos de nuevo y probamos (c) varios clics en el botón "-" hasta el tope mantienen el slider presente
    fireEvent.change(slider, { target: { value: '2.5' } })
    const minusBtn = screen
      .getAllByRole('button', { name: 'Reducir' })
      .find((b) => !b.hasAttribute('aria-pressed'))
    for (let i = 0; i < 10; i++) {
      fireEvent.click(minusBtn)
    }
    expect(screen.getByRole('slider')).toBeInTheDocument()
    expect(slider.value).toBe(slider.min)

    // (f) volver a pulsar el botón de zoom sale del zoom
    fireEvent.click(toggleBtn)
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()

    // (e) con zoom activo, Escape sale del zoom y NO llama a onClose, y un segundo Escape sí llama a onClose
    fireEvent.click(toggleBtn)
    expect(screen.getByRole('slider')).toBeInTheDocument()
    const dialog = screen.getByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
