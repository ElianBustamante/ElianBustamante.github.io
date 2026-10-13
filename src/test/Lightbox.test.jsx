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
    expect(figure.className).toContain('justify-center')

    const img = screen.getByAltText('F1')
    expect(img.className).toContain('short:max-h-[calc(100dvh-3.5rem)]!')
    expect(img.className).toContain('short:m-0!')
    expect(img.className).toContain('max-h-[60dvh]')
    expect(img.className).toContain('md:max-h-[80dvh]')

    const figcaption = container.querySelector('figcaption')
    expect(figcaption.className).toContain('short:mt-2!')
    expect(figcaption.className).not.toContain('short:absolute')
    expect(figcaption.className).not.toContain('short:bottom-1')
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
    expect(dataLine.className).toContain('short:text-[12px]')
  })
})
