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
  })

  it('renders a list item per photo with same height class', () => {
    render(<PhotoGallery />)
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
    listItems.forEach(li => {
      expect(li.className).toContain('h-[220px]')
    })
  })

  it('renders alt in Spanish and changes to English', async () => {
    const { rerender } = render(<PhotoGallery />)
    expect(screen.getByAltText('Foto uno')).toBeInTheDocument()
    
    await i18n.changeLanguage('en')
    rerender(<PhotoGallery />)
    expect(screen.getByAltText('Photo one')).toBeInTheDocument()
  })

  it('does not show buttons when scrollWidth <= clientWidth', () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1000 })
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 1000 })
    
    render(<PhotoGallery />)
    expect(screen.queryByRole('button', { name: 'Fotos anteriores' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Más fotos' })).not.toBeInTheDocument()
  })

  it('shows buttons when scrollWidth > clientWidth, handles clicks and disabled state', async () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1000 })
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 2000 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, value: 0 })
    
    // Mock scrollBy
    const scrollByMock = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollBy', { configurable: true, value: scrollByMock })
    
    render(<PhotoGallery />)
    
    const nextBtn = screen.getByRole('button', { name: 'Más fotos' })
    const prevBtn = screen.getByRole('button', { name: 'Fotos anteriores' })
    
    expect(prevBtn).toBeDisabled()
    expect(nextBtn).not.toBeDisabled()
    
    const user = userEvent.setup()
    await user.click(nextBtn)
    
    expect(scrollByMock).toHaveBeenCalledWith({ left: 800, behavior: 'smooth' })
  })

  it('opens dialog with counter on click', async () => {
    render(<PhotoGallery />)
    const images = screen.getAllByRole('button').filter(b => b.querySelector('img'))
    const user = userEvent.setup()
    
    await user.click(images[1]) // Click second photo
    
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
