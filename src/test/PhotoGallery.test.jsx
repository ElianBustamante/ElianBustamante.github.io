import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import PhotoGallery from '../components/PhotoGallery'
import React from 'react'
import i18n from '../i18n'

const { mockPhotos } = vi.hoisted(() => ({
  mockPhotos: [
    { id: '1', thumb: { src: '/photos/1-thumb.webp', width: 800, height: 533 }, large: { src: '/photos/1-large.webp', width: 2400, height: 1600 }, alt: { es: 'Foto uno', en: 'Photo one' }, exif: {} },
    { id: '2', thumb: { src: '/photos/2-thumb.webp', width: 533, height: 800 }, large: { src: '/photos/2-large.webp', width: 1600, height: 2400 }, alt: { es: 'Foto dos', en: 'Photo two' }, exif: {} },
    { id: '3', thumb: { src: '/photos/3-thumb.webp', width: 800, height: 533 }, large: { src: '/photos/3-large.webp', width: 2400, height: 1600 }, alt: { es: 'Foto tres', en: 'Photo three' }, exif: {} }
  ]
}))

vi.mock('../data/photos.json', () => ({
  default: mockPhotos
}))

describe('PhotoGallery', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('es')
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    mockPhotos.length = 3 // Restore mock array
    mockPhotos[0] = { id: '1', thumb: { src: '/photos/1-thumb.webp', width: 800, height: 533 }, large: { src: '/photos/1-large.webp', width: 2400, height: 1600 }, alt: { es: 'Foto uno', en: 'Photo one' }, exif: {} }
    mockPhotos[1] = { id: '2', thumb: { src: '/photos/2-thumb.webp', width: 533, height: 800 }, large: { src: '/photos/2-large.webp', width: 1600, height: 2400 }, alt: { es: 'Foto dos', en: 'Photo two' }, exif: {} }
    mockPhotos[2] = { id: '3', thumb: { src: '/photos/3-thumb.webp', width: 800, height: 533 }, large: { src: '/photos/3-large.webp', width: 2400, height: 1600 }, alt: { es: 'Foto tres', en: 'Photo three' }, exif: {} }
  })

  it('renders one list item per photo with inline height style', () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1200 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })
    render(<PhotoGallery />)
    const images = screen.getAllByRole('button').filter(b => b.querySelector('img'))
    expect(images).toHaveLength(3)
    const firstLi = images[0].parentElement
    expect(firstLi.style.height).toBe('330px') // from W=1200 -> h=330
  })

  it('renders alt in Spanish and changes to English', async () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1200 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })
    const { rerender } = render(<PhotoGallery />)
    expect(screen.getByAltText('Foto uno')).toBeInTheDocument()
    
    await i18n.changeLanguage('en')
    rerender(<PhotoGallery />)
    expect(screen.getByAltText('Photo one')).toBeInTheDocument()
  })

  it('does not show buttons and counter when there is only 1 page', () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 2000 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })
    render(<PhotoGallery />)
    expect(screen.queryByRole('button', { name: 'Fotos anteriores' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Más fotos' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Página/)).not.toBeInTheDocument()
  })

  it('shows buttons and counter when there are multiple pages', async () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 400 }) // h = 266, w1=399 > 400 => separate pages
    const scrollToMock = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: scrollToMock })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })
    
    render(<PhotoGallery />)
    
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    const nextBtn = screen.getByRole('button', { name: 'Más fotos' })
    const prevBtn = screen.getByRole('button', { name: 'Fotos anteriores' })
    
    expect(prevBtn).toBeDisabled()
    expect(nextBtn).not.toBeDisabled()
    
    const user = userEvent.setup()
    await user.click(nextBtn)
    
    expect(scrollToMock).toHaveBeenCalledWith({ left: 400, behavior: 'smooth' })
  })

  it('opens dialog with counter on click', async () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1200 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })
    render(<PhotoGallery />)
    const images = screen.getAllByRole('button').filter(b => b.querySelector('img'))
    const user = userEvent.setup()
    
    await user.click(images[1])
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Foto 2 de 3')).toBeInTheDocument()
  })

  it('renders no list when photos is empty', () => {
    mockPhotos.length = 0
    render(<PhotoGallery />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
