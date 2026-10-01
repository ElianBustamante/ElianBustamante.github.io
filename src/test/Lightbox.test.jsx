import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Lightbox from '../components/Lightbox'
import React from 'react'
import i18n from '../i18n'

const mockPhotos = [
  { id: '1', large: { src: '/1.webp' }, alt: { es: 'F1', en: 'P1' }, exif: { camera: 'Cam' }, title: { es: 'T1' } },
  { id: '2', large: { src: '/2.webp' }, alt: { es: 'F2', en: 'P2' }, exif: { camera: null, lens: null }, title: null },
  { id: '3', large: { src: '/3.webp' }, alt: { es: 'F3', en: 'P3' }, exif: { iso: 100 }, title: null }
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
})
